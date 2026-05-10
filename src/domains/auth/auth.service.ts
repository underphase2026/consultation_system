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
import { JwtPayload, ResetJwtPayload } from '../../common/types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
  async registerOwner(dto: RegisterOwnerDto) {
    this.validateTerms(dto.terms);
    this.validatePhoneAuth(dto.isPhoneAuth);

    const user = await this.usersService.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: dto.password,
      role: Role.OWNER,
      marketingAgreed: dto.terms.marketingAgreed ?? false,
    });

    return {
      userId: user.id,
      referralCode: user.referralCode,
    };
  }

  // ─────────────────────────────────────────────
  // A3. 직원 회원가입
  // ─────────────────────────────────────────────
  async registerStaff(dto: RegisterStaffDto) {
    this.validateTerms(dto.terms);
    this.validatePhoneAuth(dto.isPhoneAuth);

    const user = await this.usersService.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: dto.password,
      role: Role.STAFF,
      marketingAgreed: dto.terms.marketingAgreed ?? false,
    });

    return { userId: user.id };
  }

  // ─────────────────────────────────────────────
  // A4-a. 비밀번호 재설정 토큰 발급 (SMS 인증 완료 후 호출)
  //        추후 SMS 연동 시 실제 OTP 검증 로직 추가 예정
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
  // A4-b. 비밀번호 변경 (재설정 토큰 인증 후 호출)
  // ─────────────────────────────────────────────
  async forgotPassword(phoneNumber: string, dto: ForgotPasswordDto) {
    await this.usersService.updatePasswordByPhone(phoneNumber, dto.newPassword);
    return { message: '비밀번호가 변경되었습니다.' };
  }

  // ─────────────────────────────────────────────
  // Validators
  // ─────────────────────────────────────────────
  private validatePhoneAuth(isPhoneAuth: boolean): void {
    if (!isPhoneAuth) {
      throw new BadRequestException({
        code: 'PHONE_AUTH_REQUIRED',
        message: '휴대폰 인증이 완료되지 않았습니다.',
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
