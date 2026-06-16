import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomInt, createHash } from 'crypto';
import { OkSmsService } from '../../infrastructure/sms/ok-sms.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { SendSmsDto, VerifySmsDto } from './dto/sms.dto';

interface PhoneVerifyPayload {
  sub: string; // phoneNumber
  type: 'phone-verify';
}

@Injectable()
export class SmsAuthService {
  private readonly DAILY_LIMIT = 5;
  private readonly OTP_TTL_SECONDS = 180; // 3분

  constructor(
    private readonly okSmsService: OkSmsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 보안성이 보장된 6자리 OTP 생성
   */
  private generateOtp(): string {
    return randomInt(0, 1000000).toString().padStart(6, '0');
  }

  /**
   * 당일 자정까지 남은 시간을 초로 반환
   */
  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
  }

  /**
   * 인증 번호를 생성하고 SMS로 발송 (A-SMS-1)
   */
  async sendSmsCode(dto: SendSmsDto) {
    const { phoneNumber } = dto;
    const dailyKey = `sms:daily:${phoneNumber}`;
    const otpKey = `sms:otp:${phoneNumber}`;

    // 1. 휴대폰 번호 기반 일일 발송 횟수 제한 체크
    const currentCount = await this.redisService.get(dailyKey);
    if (currentCount && parseInt(currentCount, 10) >= this.DAILY_LIMIT) {
      throw new HttpException(
        {
          code: 'TOO_MANY_REQUESTS',
          message: '일일 SMS 발송 한도를 초과했습니다.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2. 쿨타임 체크 (기존 OTP 키가 존재하면 쿨타임 중으로 간주)
    const existingOtp = await this.redisService.get(otpKey);
    if (existingOtp) {
      throw new HttpException(
        {
          code: 'COOLDOWN_ACTIVE',
          message: '잠시 후 다시 시도해 주세요. (쿨타임 적용)',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 3. OTP 생성 및 단방향 해싱
    const otp = this.generateOtp();
    const hashedOtp = createHash('sha256').update(otp).digest('hex');
    const message = `[Underphase] 인증번호는 [${otp}] 입니다. 3분 내에 입력해 주세요.`;

    // 개발 환경 편의를 위해 터미널에 OTP 출력
    console.log(`\n[SMS AUTH] 휴대폰 번호: ${phoneNumber}, 인증번호: ${otp}\n`);

    // 4. Redis에 먼저 저장 (외부 API 호출 전 상태 기록 - 실패 대비)
    await this.redisService.set(otpKey, hashedOtp, this.OTP_TTL_SECONDS);

    try {
      // 5. 외부 SMS API 호출
      const result = await this.okSmsService.send({
        to: phoneNumber,
        message,
      });

      if (result.success) {
        // 6. 성공 시 일일 횟수 증가 및 자정까지 TTL 설정
        await this.redisService.incrAndExpire(dailyKey, this.getSecondsUntilMidnight());
        return { message: '인증번호가 발송되었습니다. (3분 내 입력하세요)' };
      }
      
      throw new BadRequestException('SMS 발송에 실패했습니다.');
    } catch (error) {
      // SMS 발송 실패 시, 유저가 다시 시도할 수 있도록 OTP 롤백(삭제)
      await this.redisService.del(otpKey);
      throw error;
    }
  }

  /**
   * 사용자가 입력한 인증 번호 검증 및 토큰 발급 (A-SMS-2)
   */
  async verifySmsCode(dto: VerifySmsDto) {
    const { phoneNumber, verificationCode } = dto;
    const otpKey = `sms:otp:${phoneNumber}`;

    const hashedInput = createHash('sha256').update(verificationCode).digest('hex');

    // 개발 모드 마스터키 허용 로직 유지
    let isValid = false;
    if (verificationCode === '000000') {
      isValid = true;
      // 마스터키를 쓴 경우에도 Redis에 저장된 기존 키가 있다면 지워주는 것이 좋습니다.
      await this.redisService.del(otpKey);
    } else {
      // 원자적 검증 연산: 값이 일치하면 삭제까지 한 번에 (Race Condition 차단)
      isValid = await this.redisService.verifyAndDelete(otpKey, hashedInput);
    }

    if (!isValid) {
      throw new BadRequestException({
        code: 'INVALID_VERIFICATION_CODE',
        message: '인증 정보가 존재하지 않거나 일치하지 않습니다.',
      });
    }

    // ─────────────────────────────────────────────
    // 검증 완료 후 phoneVerifyToken (JWT) 발급
    // ─────────────────────────────────────────────
    const payload: PhoneVerifyPayload = {
      sub: phoneNumber,
      type: 'phone-verify',
    };
    
    const phoneVerifyToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'JWT_PHONE_VERIFY_SECRET',
        'phone-verify-fallback',
      ),
      expiresIn: this.configService.get<string>('JWT_PHONE_VERIFY_EXPIRES_IN', '5m') as any,
    });

    return {
      phoneVerifyToken,
      expiresIn: 300,
    };
  }
}
