import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UserProfileResponseDto } from './dto/user-response.dto';
import { MessageResponseDto } from '../auth/dto/auth-response.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** U1 — 내 정보 조회 */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiResponse({ status: 200, description: '내 정보 반환', type: UserProfileResponseDto })
  async getMe(@CurrentUser() user: User) {
    return {
      name: user.name,
      phoneNumber: user.phoneNumber,
      birthDate: user.birthDate ?? null,
      email: user.email ?? null,
      referralCode: user.referralCode,
      marketingAgreed: user.terms?.marketingAgreed ?? false,
      role: user.role,
    };
  }

  /** U2 — 내 정보 수정 */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '내 정보 수정 (이름, 이메일, 생년월일만)' })
  @ApiResponse({ status: 200, description: '수정 완료', type: MessageResponseDto })
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    const updated = await this.usersService.update(user.id, dto);
    return {
      name: updated.name,
      phoneNumber: updated.phoneNumber,
      marketingAgreed: updated.terms?.marketingAgreed ?? false,
    };
  }
}
