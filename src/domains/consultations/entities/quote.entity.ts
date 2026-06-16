import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NetworkType, Carrier } from './device.entity';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '견적명 (통신사 + 단말기명 자동생성)' })
  quoteName: string;

  @Column({ comment: '태그 (유선/무선 자동분류)' })
  tag: string;

  @Column({ type: 'enum', enum: NetworkType, comment: '유무선 구분' })
  networkType: NetworkType;

  @Column({ type: 'enum', enum: Carrier, comment: '통신사' })
  carrier: Carrier;

  @Column({ comment: '선택된 단말기 ID' })
  deviceId: string;

  @Column({ type: 'int', comment: '스냅샷: 출고가' })
  retailPrice: number;

  @Column({ type: 'int', comment: '스냅샷: 공시지원금' })
  publicSubsidy: number;

  @Column({ type: 'int', comment: '스냅샷: 할부원금' })
  principal: number;

  // 전자계약 모듈과의 확장을 위한 필드
  // CRM 도메인과 섞이지 않도록 모듈을 분리하기 위해 Foreign Key보다는 느슨한 결합(ID 저장) 방식 사용
  @Column({ nullable: true, comment: '전자계약 ID (향후 전자계약 프로세스로 전환 시 연동용)' })
  contractId: number;

  @Column({ name: 'user_id', comment: '견적을 생성한 계정 ID', nullable: true })
  userId: string;

  @Column({ name: 'store_id', comment: '견적을 생성한 매장 ID', nullable: true })
  storeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
