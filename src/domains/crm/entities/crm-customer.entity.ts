import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('crm_customers')
@Index(['storeId', 'phone'], { unique: true }) // 한 매장에 같은 연락처의 고객 중복 방지
export class CrmCustomer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // CRM 격리 규칙: 물리적 FK 및 @ManyToOne 사용 금지
  @Column({ type: 'uuid', name: 'store_id' })
  @Index()
  storeId: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ type: 'timestamp', name: 'last_contract_date', nullable: true })
  lastContractDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
