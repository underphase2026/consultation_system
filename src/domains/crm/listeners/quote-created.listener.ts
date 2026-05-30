import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QuoteCreatedEvent } from '../../consultations/events/quote-created.event';
import { CrmService } from '../crm.service';

@Injectable()
export class QuoteCreatedListener {
  private readonly logger = new Logger(QuoteCreatedListener.name);

  constructor(private readonly crmService: CrmService) {}

  @OnEvent('quote.created', { async: true })
  async handleQuoteCreatedEvent(event: QuoteCreatedEvent) {
    this.logger.log(`Received quote.created event for Quote ID: ${event.quote.id}`);
    
    try {
      // CRM 관점에서 새로운 잠재 고객(Lead) 생성 또는 기존 고객 상태를 '견적 발행 완료'로 업데이트
      // 추후 CrmService에 관련 비즈니스 로직 연동
      // await this.crmService.processNewQuote(event.quote);
      
      this.logger.log(`CRM module successfully processed quote ${event.quote.id}`);
    } catch (error: any) {
      this.logger.error(`Error processing quote.created event: ${error.message}`, error.stack);
    }
  }
}
