import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('CRM')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('stores/:storeId/customers')
  @Roles(Role.OWNER, Role.STAFF)
  @ApiOperation({ summary: '특정 매장의 CRM 고객 목록 조회' })
  async getCustomers(@CurrentUser() user: User, @Param('storeId') storeId: string) {
    return this.crmService.getCustomersByStore(user.id, user.role, storeId);
  }
}
