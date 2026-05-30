import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventOutbox, OutboxStatus } from './entities/event-outbox.entity';

@Injectable()
export class OutboxScheduler {
  private readonly logger = new Logger(OutboxScheduler.name);

  constructor(
    @InjectRepository(EventOutbox)
    private readonly outboxRepository: Repository<EventOutbox>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processOutboxEvents() {
    const pendingEvents = await this.outboxRepository.find({
      where: { status: OutboxStatus.PENDING },
      take: 50, // 한 번에 최대 50건 처리
      order: { createdAt: 'ASC' },
    });

    if (pendingEvents.length === 0) return;

    this.logger.log(`Processing ${pendingEvents.length} pending outbox events...`);

    for (const event of pendingEvents) {
      try {
        // 이벤트 발송 (예: QuoteCreatedEvent 인스턴스로 변환해서 보내야 하지만,
        // 여기서는 payload 데이터를 그대로 실어 보냅니다. Listener 측은 객체 리터럴을 받을 수 있게 처리됨)
        this.eventEmitter.emit(event.eventType, event.payload);
        
        event.status = OutboxStatus.PUBLISHED;
        await this.outboxRepository.save(event);
      } catch (error) {
        this.logger.error(`Failed to process outbox event ${event.id}:`, error);
        event.status = OutboxStatus.FAILED;
        await this.outboxRepository.save(event);
      }
    }
  }
}
