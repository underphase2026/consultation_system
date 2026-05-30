import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { Contract } from './entities/contract.entity';
import { Quote } from '../consultations/entities/quote.entity';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, Quote]),
    StoresModule, // 매장 권한 검증용
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
