import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum OutboxStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

@Entity('event_outbox')
export class EventOutbox {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '이벤트 타입 (예: quote.created)' })
  eventType: string;

  @Column('json', { comment: '이벤트에 담길 페이로드(데이터)' })
  payload: any;

  @Column({ type: 'enum', enum: OutboxStatus, default: OutboxStatus.PENDING })
  status: OutboxStatus;

  @CreateDateColumn()
  createdAt: Date;
}
