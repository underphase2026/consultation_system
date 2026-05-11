import {
  Controller,
  Get,
  Post,
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
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JoinStoreDto } from './dto/join-store.dto';
import { BusinessVerifyDto } from './dto/business-verify.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import {
  StoreItemResponseDto,
  CreateStoreResponseDto,
  JoinStoreResponseDto,
} from './dto/store-response.dto';

@ApiTags('Stores')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  /** S1 — 내 매장 조회 (OWNER: 소유 전체 / STAFF: 소속 단일) */
  @Get('mine')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.OWNER, Role.STAFF)
  @ApiOperation({ summary: '내 매장 조회' })
  @ApiResponse({ status: 200, description: '매장 목록 반환', type: [StoreItemResponseDto] })
  getMyStores(@CurrentUser() user: User) {
    return this.storesService.getMyStores(user.id, user.role);
  }

  /** S2 — 매장 등록 (OWNER 전용) */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: '매장 등록 (OWNER 전용)' })
  @ApiResponse({ status: 201, description: '매장 생성 완료, storeCode 반환', type: CreateStoreResponseDto })
  createStore(@CurrentUser() user: User, @Body() dto: CreateStoreDto) {
    return this.storesService.createStore(user.id, dto);
  }

  /** S3 — 매장 합류 (STAFF 전용) */
  @Post('join')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.STAFF)
  @ApiOperation({ summary: '매장 합류 (STAFF 전용, storeCode 입력)' })
  @ApiResponse({ status: 200, description: '합류 완료', type: JoinStoreResponseDto })
  joinStore(@CurrentUser() user: User, @Body() dto: JoinStoreDto) {
    return this.storesService.joinStore(user.id, dto);
  }

  /** S4 — 사업자 번호 진위 확인 (OWNER 전용, 매장 생성 전 호출) */
  @Post('business-verify')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: '사업자 번호 진위 확인 (OWNER 전용)' })
  @ApiResponse({ status: 200, description: '유효한 사업자 번호' })
  verifyBusinessNumber(@Body() dto: BusinessVerifyDto) {
    return this.storesService.verifyBusinessNumber(dto.businessRegistrationNumber);
  }
}
