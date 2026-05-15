import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { SendSmsDto, VerifySmsDto } from './dto/sms.dto'; // SMS 인증 비활성화
import { JwtPayload, ResetJwtPayload } from '../../common/types/jwt-payload.type';
// import { RedisService } from '../../infrastructure/redis/redis.service'; // SMS 인증 비활성화
// import { OkSmsService } from '../../infrastructure/sms/ok-sms.service'; // SMS 인증 비활성화

/** Redis에 저장할 SMS 인증번호 키 접두사 */
// const SMS_CODE_PREFIX = 'sms:code:'; // SMS 인증 비활성화
/** 인증번호 유효시간: 3분 */
// const SMS_CODE_TTL = 180; // SMS 인증 비활성화

/** phone-verify JWT payload 타입 */
interface PhoneVerifyPayload {
  sub: string; // phoneNumber
  type: 'phone-verify';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // private readonly redisService: RedisService, // SMS 인증 비활성화
    // private readonly okSmsService: OkSmsService, // SMS 인증 비활성화
  ) {}

  // ─────────────────────────────────────────────
  // A1. 로그인
  // ─────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.usersService.findByPhoneNumber(dto.phoneNumber);
    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: '휴대폰 번호 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const isMatch = await this.usersService.validatePassword(user, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: '휴대폰 번호 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const payload: JwtPayload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      role: user.role,
      userId: user.id,
    };
  }

  // ─────────────────────────────────────────────
  // A2. 대표 회원가입
  // ─────────────────────────────────────────────
  async registerOwner(dto: RegisterOwnerDto, phoneVerifyToken: string) {
    this.validateTerms(dto.terms);
    await this.validatePhoneVerifyToken(phoneVerifyToken, dto.phoneNumber);

    const user = await this.usersService.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: dto.password,
      role: Role.OWNER,
      terms: {
        serviceAgreed: dto.terms.serviceAgreed,
        privacyAgreed: dto.terms.privacyAgreed,
        marketingAgreed: dto.terms.marketingAgreed ?? false,
      },
    });

    return {
      userId: user.id,
      referralCode: user.referralCode,
    };
  }

  // ─────────────────────────────────────────────
  // A3. 직원 회원가입
  // ─────────────────────────────────────────────
  async registerStaff(dto: RegisterStaffDto, phoneVerifyToken: string) {
    this.validateTerms(dto.terms);
    await this.validatePhoneVerifyToken(phoneVerifyToken, dto.phoneNumber);

    const user = await this.usersService.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: dto.password,
      role: Role.STAFF,
      terms: {
        serviceAgreed: dto.terms.serviceAgreed,
        privacyAgreed: dto.terms.privacyAgreed,
        marketingAgreed: dto.terms.marketingAgreed ?? false,
      },
    });

    return { userId: user.id };
  }

  // ─────────────────────────────────────────────────────────────────
  // A-SMS-1 & A-SMS-2: SMS 인증 사용 비활성화 (Redis 미연결 시 서버 에러 발생)
  // ─────────────────────────────────────────────────────────────────
  /*
  async sendSmsCode(dto: SendSmsDto) {
    const code = this.generateSixDigitCode();
    const redisKey = `${SMS_CODE_PREFIX}${dto.phoneNumber}`;

    if (this.redisService.isConnected()) {
      await this.redisService.set(redisKey, code, SMS_CODE_TTL);
    }

    await this.okSmsService.send({
      to: dto.phoneNumber,
      message: `[Underphase] 인증번호: ${code} (3분 내 입력)`,
    });

    return { message: '인증번호가 발송되었습니다. (3분 내 입력하세요)' };
  }

  async verifySmsCode(dto: VerifySmsDto) {
    const redisKey = `${SMS_CODE_PREFIX}${dto.phoneNumber}`;

    if (!this.redisService.isConnected()) {
      if (dto.verificationCode !== '000000') {
        throw new BadRequestException({
          code: 'INVALID_VERIFICATION_CODE',
          message: '인증번호가 일치하지 않습니다. (개발 모드: 000000 사용)',
        });
      }
    } else {
      const stored = await this.redisService.get(redisKey);

      if (stored === null) {
        throw new BadRequestException({
          code: 'VERIFICATION_CODE_EXPIRED',
          message: '인증번호가 만료되었습니다. 다시 요청해 주세요.',
        });
      }

      if (stored !== dto.verificationCode) {
        throw new BadRequestException({
          code: 'INVALID_VERIFICATION_CODE',
          message: '인증번호가 일치하지 않습니다.',
        });
      }

      await this.redisService.del(redisKey);
    }

    const payload: PhoneVerifyPayload = {
      sub: dto.phoneNumber,
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
  */

  // ─────────────────────────────────────────────
  // A4-a. 비밀번호 재설정 토큰 발급
  // ─────────────────────────────────────────────
  async issueResetToken(phoneNumber: string) {
    const user = await this.usersService.findByPhoneNumber(phoneNumber);
    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: '가입되지 않은 휴대폰 번호입니다.',
      });
    }

    const payload: ResetJwtPayload = { sub: phoneNumber, type: 'reset' };
    const resetToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'JWT_RESET_SECRET',
        'fallback-reset-secret',
      ),
      expiresIn: this.configService.get<string>('JWT_RESET_EXPIRES_IN', '10m') as any,
    });

    return { resetToken };
  }

  // ─────────────────────────────────────────────
  // A4-b. 비밀번호 변경
  // ─────────────────────────────────────────────
  async forgotPassword(phoneNumber: string, dto: ForgotPasswordDto) {
    await this.usersService.updatePasswordByPhone(phoneNumber, dto.newPassword);
    return { message: '비밀번호가 변경되었습니다.' };
  }

  // ─────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────

  /** 6자리 랜덤 숫자 생성 */
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** phoneVerifyToken 검증: 발급된 번호와 요청 번호가 일치하는지 확인 */
  private async validatePhoneVerifyToken(
    token: string,
    phoneNumber: string,
  ): Promise<void> {
    try {
      const payload = this.jwtService.verify<PhoneVerifyPayload>(token, {
        secret: this.configService.get<string>(
          'JWT_PHONE_VERIFY_SECRET',
          'phone-verify-fallback',
        ),
      });

      if (payload.type !== 'phone-verify' || payload.sub !== phoneNumber) {
        throw new Error('Mismatch');
      }
    } catch {
      throw new BadRequestException({
        code: 'PHONE_AUTH_REQUIRED',
        message: '유효한 휴대폰 인증 토큰이 필요합니다. SMS 인증을 먼저 완료해 주세요.',
      });
    }
  }

  private validateTerms(terms: {
    serviceAgreed: boolean;
    privacyAgreed: boolean;
  }): void {
    if (!terms.serviceAgreed || !terms.privacyAgreed) {
      throw new BadRequestException({
        code: 'TERMS_REQUIRED',
        message: '필수 약관에 동의해주세요.',
      });
    }
  }
}
