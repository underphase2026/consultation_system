import {
  Controller,
  Post,
  Body,
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
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
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
  @ApiOperation({ summary: '대표 회원가입' })
  @ApiResponse({ status: 201, description: 'userId & referralCode 반환', type: RegisterResponseDto })
  async registerOwner(@Body() dto: RegisterOwnerDto) {
    return this.authService.registerOwner(dto);
  }

  /** A3 — 직원 회원가입 */
  @Post('register/staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '직원 회원가입' })
  @ApiResponse({ status: 201, description: 'userId 반환', type: RegisterResponseDto })
  async registerStaff(@Body() dto: RegisterStaffDto) {
    return this.authService.registerStaff(dto);
  }

  /**
   * A4-a — 비밀번호 재설정 토큰 발급
   * 휴대폰 인증 완료 후 이 엔드포인트를 호출해 10분짜리 reset 토큰 발급.
   * (추후 SMS OTP 검증 로직 연동 예정)
   */
  @Post('reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '비밀번호 재설정 토큰 발급 (휴대폰 인증 완료 후 호출)',
  })
  @ApiResponse({ status: 200, description: '10분 유효한 resetToken 반환', type: ResetTokenResponseDto })
  issueResetToken(@Body('phoneNumber') phoneNumber: string) {
    return this.authService.issueResetToken(phoneNumber);
  }

  /**
   * A4-b — 비밀번호 변경
   * Authorization: Bearer <resetToken> 필요.
   * 새 비밀번호만 Body로 전달.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtResetGuard)
  @ApiBearerAuth('reset-token')
  @ApiOperation({
    summary: '비밀번호 변경 (reset-token 필요)',
    description:
      '휴대폰 인증 후 발급된 resetToken을 Authorization 헤더에 담아 호출. Body에는 새 비밀번호만 전달.',
  })
  @ApiResponse({ status: 200, description: '비밀번호 변경 완료' })
  forgotPassword(
    @ResetUser() resetUser: { phoneNumber: string },
    @Body() dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(resetUser.phoneNumber, dto);
  }
}
