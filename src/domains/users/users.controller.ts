import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';
import { UserProfileResponseDto } from './dto/user-response.dto';
import { MessageResponseDto } from '../auth/dto/auth-response.dto';

import { Role } from '../../common/enums/role.enum';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** U3 — 모든 유저 목록 조회 (관리자 전용) */
  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: '모든 유저 목록 (관리자 전용)', description: '모든 유저 목록을 조회합니다.' })
  @ApiResponse({ status: 200, description: '모든 유저 목록 반환' })
  async getAllUsers() {
    return [];
  }

  /** U4 — 유저 조회 (관리자 전용) */
  @Get(':user_id')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: '유저 조회 (관리자 전용)', description: 'ID를 사용하여 학생/유저를 조회합니다.' })
  @ApiParam({ name: 'user_id', description: '조회할 유저의 ID' })
  @ApiResponse({ status: 200, description: '유저 정보 반환' })
  async getUserById(@Param('user_id') userId: string) {
    return { id: userId };
  }

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
