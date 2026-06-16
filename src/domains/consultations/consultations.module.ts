import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './entities/device.entity';
import { DeviceHistory } from './entities/device-history.entity';
import { Quote } from './entities/quote.entity';
import { EventOutbox } from './entities/event-outbox.entity';
import { DeviceSpec } from './entities/device-spec.entity';
import { UserTabs } from './entities/user-tabs.entity';
import { TempQuote } from './entities/temp-quote.entity';
import { ConsultationsController } from './consultations.controller';
import { ConsultationsService } from './consultations.service';
import { QuoteQueryService } from './quote-query.service';
import { OutboxScheduler } from './outbox.scheduler';
import { TempQuoteService } from './temp-quote.service';
import { TempQuoteController } from './temp-quote.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Device, DeviceHistory, Quote, EventOutbox, DeviceSpec, UserTabs, TempQuote])],
  controllers: [ConsultationsController, TempQuoteController],
  providers: [ConsultationsService, QuoteQueryService, OutboxScheduler, TempQuoteService],
  exports: [TypeOrmModule],
})
export class ConsultationsModule {}
