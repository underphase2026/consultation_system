import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
  UseGuards,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SendSmsDto, VerifySmsDto } from './dto/sms.dto';
import { JwtResetGuard } from '../../common/guards/jwt-reset.guard';
import {
  RegisterResponseDto,
  LoginResponseDto,
  ResetTokenResponseDto,
  MessageResponseDto,
} from './dto/auth-response.dto';

/** reset 토큰에서 phoneNumber를 꺼내는 임시 파라미터 데코레이터 */
const ResetUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): { phoneNumber: string } =>
    ctx.switchToHttp().getRequest().user as { phoneNumber: string },
);

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** A1 — 로그인 */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인 (휴대폰 번호 + 비밀번호)' })
  @ApiResponse({ status: 200, description: 'JWT 액세스 토큰 반환', type: LoginResponseDto })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /** A2 — 대표 회원가입 */
  @Post('register/owner')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '대표 회원가입 (Authorization: Bearer <phoneVerifyToken> 필요)',
    description: 'SMS 인증 후 발급된 phoneVerifyToken을 Authorization 헤더에 Bearer 토큰으로 담아 호출하세요.',
  })
  @ApiResponse({ status: 201, description: 'userId & referralCode 반환', type: RegisterResponseDto })
  async registerOwner(
    @Headers('authorization') authHeader: string,
    @Body() dto: RegisterOwnerDto,
  ) {
    const token = this.extractBearerToken(authHeader);
    return this.authService.registerOwner(dto, token);
  }

  /** A3 — 직원 회원가입 */
  @Post('register/staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '직원 회원가입 (Authorization: Bearer <phoneVerifyToken> 필요)',
    description: 'SMS 인증 후 발급된 phoneVerifyToken을 Authorization 헤더에 Bearer 토큰으로 담아 호출하세요.',
  })
  @ApiResponse({ status: 201, description: 'userId 반환', type: RegisterResponseDto })
  async registerStaff(
    @Headers('authorization') authHeader: string,
    @Body() dto: RegisterStaffDto,
  ) {
    const token = this.extractBearerToken(authHeader);
    return this.authService.registerStaff(dto, token);
  }

  /** Authorization 헤더에서 Bearer 토큰 추출 헬퍼 */
  private extractBearerToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new BadRequestException({
        code: 'PHONE_AUTH_REQUIRED',
        message: 'Authorization 헤더에 SMS 인증 토큰이 필요합니다. (Bearer <phoneVerifyToken>)',
      });
    }
    return authHeader.replace('Bearer ', '').trim();
  }

  /*
  // A-SMS-1 — 인증번호 발송 요청
  @Post('sms/send')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary: 'SMS 인증번호 발송 요청 (분당 3회 제한)',
    description: '입력한 번호로 6자리 인증번호를 발송합니다. 인증번호는 3분간 유효합니다.',
  })
  @ApiResponse({ status: 200, description: '발송 완료', type: MessageResponseDto })
  @ApiResponse({ status: 429, description: '너무 많은 요청 (분당 3회 초과)' })
  async sendSmsCode(@Body() dto: SendSmsDto) {
    return this.authService.sendSmsCode(dto);
  }

  // A-SMS-2 — 인증번호 검증
  @Post('sms/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'SMS 인증번호 검증 (분당 5회 제한)',
    description: '인증번호 일치 시 5분 유효한 phoneVerifyToken을 반환합니다. 회원가입 시 이 토큰을 사용하세요.',
  })
  @ApiResponse({
    status: 200,
    description: '인증 성공 — phoneVerifyToken 반환',
    schema: {
      example: {
        success: true,
        data: { phoneVerifyToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', expiresIn: 300 },
      },
    },
  })
  @ApiResponse({ status: 400, description: '인증번호 불일치 또는 만료' })
  @ApiResponse({ status: 429, description: '너무 많은 요청 (분당 5회 초과)' })
  async verifySmsCode(@Body() dto: VerifySmsDto) {
    return this.authService.verifySmsCode(dto);
  }
  */

  /**
   * A4-a — 비밀번호 재설정 토큰 발급
   */
  @Post('reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '비밀번호 재설정 토큰 발급 (SMS 인증 완료 후 호출)',
  })
  @ApiResponse({ status: 200, description: '10분 유효한 resetToken 반환', type: ResetTokenResponseDto })
  issueResetToken(@Body('phoneNumber') phoneNumber: string) {
    return this.authService.issueResetToken(phoneNumber);
  }

  /**
   * A4-b — 비밀번호 변경
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtResetGuard)
  @ApiBearerAuth('reset-token')
  @ApiOperation({
    summary: '비밀번호 변경 (reset-token 필요)',
  })
  @ApiResponse({ status: 200, description: '비밀번호 변경 완료' })
  forgotPassword(
    @ResetUser() resetUser: { phoneNumber: string },
    @Body() dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(resetUser.phoneNumber, dto);
  }
}
