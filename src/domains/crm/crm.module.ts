import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { CrmCustomer } from './entities/crm-customer.entity';
import { StoresModule } from '../stores/stores.module';
import { QuoteCreatedListener } from './listeners/quote-created.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([CrmCustomer]),
    StoresModule,
  ],
  controllers: [CrmController],
  providers: [CrmService, QuoteCreatedListener],
})
export class CrmModule {}
