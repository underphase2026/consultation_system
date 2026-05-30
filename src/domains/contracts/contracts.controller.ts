import { Controller, Post, Body, Param, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeController } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto, ContractResponseDto } from './dto/contract.dto';
import { CreateElectronicContractDto } from './dto/create-electronic-contract.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

@ApiTags('Contracts')
@ApiBearerAuth('access-token')
@ApiExcludeController()
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.OWNER, Role.STAFF) // 대표와 직원 모두 계약서 작성 가능
  @ApiOperation({ summary: '신규 전자계약서 생성' })
  @ApiResponse({ status: 201, type: ContractResponseDto })
  async createContract(@CurrentUser() user: User, @Body() dto: CreateContractDto) {
    return this.contractsService.createContract(user.id, user.role, dto);
  }

  @Post('electronic')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.OWNER, Role.STAFF)
  @ApiOperation({ summary: '전자계약 우선 매칭 엔드포인트 신설' })
  async prepareElectronicContract(@CurrentUser() user: User, @Body() dto: CreateElectronicContractDto) {
    return this.contractsService.prepareElectronicContract(user.id, user.role, dto);
  }

  @Patch(':id/esign-complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전자서명 완료 처리 (웹훅 등에서 호출)' })
  async completeSignature(@Param('id') contractId: string) {
    return this.contractsService.completeSignature(contractId);
  }
}
