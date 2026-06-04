import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { CrmCustomer } from './entities/crm-customer.entity';
import { StoresModule } from '../stores/stores.module';
import { CrmEventListener } from './listeners/crm-event.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([CrmCustomer]),
    StoresModule,
  ],
  controllers: [CrmController],
  providers: [CrmService, CrmEventListener],
})
export class CrmModule {}
