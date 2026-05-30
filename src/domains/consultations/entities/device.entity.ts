import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum NetworkType {
  WIRELESS = 'WIRELESS',
  WIRED = 'WIRED',
}

export enum Carrier {
  SKT = 'SKT',
  KT = 'KT',
  LGU = 'LGU',
}

@Entity('devices')
@Index(['networkType', 'carrier']) // 복합 인덱스 (기본 필터링용)
// TypeORM fulltext 옵션을 활용한 인덱스 (PostgreSQL의 경우 Migration을 통해 pg_trgm GIN 인덱스 생성 권장)
@Index('IDX_DEVICE_NAME_FULLTEXT', ['deviceName'], { fulltext: true })
@Index('IDX_MODEL_NAME_FULLTEXT', ['modelName'], { fulltext: true })
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NetworkType, comment: '유무선 구분' })
  networkType: NetworkType;

  @Column({ type: 'enum', enum: Carrier, comment: '통신사' })
  carrier: Carrier;

  @Column({ comment: '단말기 기종명' })
  deviceName: string;

  @Column({ comment: '모델명' })
  modelName: string;

  @Column({ type: 'int', default: 0, comment: '출고가' })
  retailPrice: number;

  @Column({ type: 'int', default: 0, comment: '공시지원금' })
  publicSubsidy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
