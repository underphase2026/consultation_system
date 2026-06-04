import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CrmService } from '../crm.service';

@Injectable()
export class CrmEventListener {
  private readonly logger = new Logger(CrmEventListener.name);

  constructor(private readonly crmService: CrmService) {}

  /**
   * 리스너 1: 견적 생성 완료 (Outbox 연동)
   */
  @OnEvent('quote.created', { async: true })
  async handleQuoteCreatedEvent(payload: any) {
    this.logger.log(`Received quote.created event for Quote ID: ${payload.quote?.id}`);
    
    try {
      await this.crmService.processQuoteCreated(payload);
    } catch (error: any) {
      this.logger.error(`Error processing quote.created event: ${error.message}`, error.stack);
      // 의도적으로 throw하여 Outbox 스케줄러가 실패로 마킹하거나 재시도할 수 있게 함 (Phase 3 멱등성 대비)
      throw error;
    }
  }

  /**
   * 리스너 2: 서드파티 전자계약 서명 완료 (Outbox 연동)
   */
  @OnEvent('contract.signed', { async: true })
  async handleContractSignedEvent(payload: any) {
    this.logger.log(`Received contract.signed event for Contract ID: ${payload.contractId}`);
    
    try {
      await this.crmService.processContractSigned(payload);
    } catch (error: any) {
      this.logger.error(`Error processing contract.signed event: ${error.message}`, error.stack);
      throw error;
    }
  }
}
