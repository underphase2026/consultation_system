import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { DeviceHistory } from './entities/device-history.entity';
import { Quote } from './entities/quote.entity';
import { EventOutbox } from './entities/event-outbox.entity';
import { DeviceSpec } from './entities/device-spec.entity';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { QuoteQueryService } from './quote-query.service';
import { OutboxScheduler } from './outbox.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Device, DeviceHistory, Quote, EventOutbox, DeviceSpec])],
  controllers: [ConsultationsController],
  providers: [ConsultationsService, QuoteQueryService, OutboxScheduler],
  exports: [TypeOrmModule],
})
export class ConsultationsModule {}
