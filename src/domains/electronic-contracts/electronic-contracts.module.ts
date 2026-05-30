import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ElectronicContract } from './entities/electronic-contract.entity';
import { Quote } from '../consultations/entities/quote.entity';
import { EventOutbox } from '../consultations/entities/event-outbox.entity';
import { ElectronicContractsService } from './electronic-contracts.service';
import { ElectronicContractsController } from './electronic-contracts.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ElectronicContract, Quote, EventOutbox]),
    HttpModule,
  ],
  controllers: [ElectronicContractsController],
  providers: [ElectronicContractsService],
  exports: [TypeOrmModule, ElectronicContractsService],
})
export class ElectronicContractsModule {}
