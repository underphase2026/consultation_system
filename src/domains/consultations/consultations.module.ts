import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { Quote } from './entities/quote.entity';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Quote])],
  controllers: [ConsultationsController],
  providers: [ConsultationsService],
  exports: [TypeOrmModule],
})
export class ConsultationsModule {}
