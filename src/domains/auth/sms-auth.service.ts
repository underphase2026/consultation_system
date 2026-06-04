import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { OkSmsService } from '../../infrastructure/sms/ok-sms.service';
import { SendSmsDto, VerifySmsDto } from './dto/sms.dto';

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

interface PhoneVerifyPayload {
  sub: string; // phoneNumber
  type: 'phone-verify';
}

@Injectable()
export class SmsAuthService {
  // 인메모리 OTP 저장소 (Authentication_Message 구조 이전)
  private readonly otpStore = new Map<string, OtpRecord>();
  private readonly OTP_EXPIRY_MS = 3 * 60 * 1000; // 3분 만료

  constructor(
    private readonly okSmsService: OkSmsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 보안성이 보장된 6자리 OTP 생성
   */
  private generateOtp(): string {
    return randomInt(0, 1000000).toString().padStart(6, '0');
  }

  /**
   * 인증 번호를 생성하고 SMS로 발송 (A-SMS-1)
   */
  async sendSmsCode(dto: SendSmsDto) {
    const otp = this.generateOtp();
    const message = `[Underphase] 인증번호는 [${otp}] 입니다. 3분 내에 입력해 주세요.`;

    // 개발 환경 편의를 위해 터미널에 OTP 출력
    console.log(`\n[SMS AUTH] 휴대폰 번호: ${dto.phoneNumber}, 인증번호: ${otp}\n`);

    // 1. 발송 요청
    const result = await this.okSmsService.send({
      to: dto.phoneNumber,
      message,
    });

    if (result.success) {
      // 2. 발송 성공 시 메모리에 저장
      this.otpStore.set(dto.phoneNumber, {
        otp,
        expiresAt: Date.now() + this.OTP_EXPIRY_MS,
      });

      return { message: '인증번호가 발송되었습니다. (3분 내 입력하세요)' };
    }

    throw new BadRequestException('SMS 발송에 실패했습니다.');
  }

  /**
   * 사용자가 입력한 인증 번호 검증 및 토큰 발급 (A-SMS-2)
   */
  async verifySmsCode(dto: VerifySmsDto) {
    const { phoneNumber, verificationCode } = dto;
    const record = this.otpStore.get(phoneNumber);

    if (!record) {
      // 개발 모드 마스터키 허용 로직 유지
      if (verificationCode !== '000000') {
        throw new BadRequestException({
          code: 'INVALID_VERIFICATION_CODE',
          message: '인증 정보가 존재하지 않거나 만료되었습니다.',
        });
      }
    } else {
      if (Date.now() > record.expiresAt) {
        this.otpStore.delete(phoneNumber);
        throw new BadRequestException({
          code: 'VERIFICATION_CODE_EXPIRED',
          message: '인증번호가 만료되었습니다. 다시 요청해 주세요.',
        });
      }

      // 실제 OTP도 틀리고, 마스터키도 아니면 에러
      if (record.otp !== verificationCode && verificationCode !== '000000') {
        throw new BadRequestException({
          code: 'INVALID_VERIFICATION_CODE',
          message: '인증번호가 일치하지 않습니다.',
        });
      }

      // 인증 성공 시 메모리에서 삭제
      this.otpStore.delete(phoneNumber);
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
