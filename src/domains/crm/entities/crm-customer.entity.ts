import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CrmCustomerStatus {
  CONSULTING = 'CONSULTING',
  CONTRACT_COMPLETED = 'CONTRACT_COMPLETED',
  ACTIVATION_PENDING = 'ACTIVATION_PENDING',
}

@Entity('crm_customers')
@Index(['storeId', 'phone'], { unique: true }) // 한 매장에 같은 연락처의 고객 중복 방지
export class CrmCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // CRM 격리 규칙: 물리적 FK 및 @ManyToOne 사용 금지
  @Column({ type: 'uuid', name: 'store_id', nullable: true })
  @Index()
  storeId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: CrmCustomerStatus,
    default: CrmCustomerStatus.CONSULTING,
  })
  status: CrmCustomerStatus;

  @Column({ type: 'timestamp', name: 'last_contract_date', nullable: true })
  lastContractDate: Date;

  @Column({ type: 'json', nullable: true, comment: '최신 견적 ID 등 여러 외부 식별자 저장' })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
