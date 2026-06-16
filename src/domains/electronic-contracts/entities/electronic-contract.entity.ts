import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ElectronicContractStatus {
  PENDING = 'PENDING',
  SIGNED = 'SIGNED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('electronic_contracts')
export class ElectronicContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '연관된 견적(Quote)의 ID' })
  quoteId: string;

  @Column({ nullable: true, comment: '서드파티 전자계약 서비스에서 발급받은 Document ID' })
  documentId: string;

  @Column({
    type: 'enum',
    enum: ElectronicContractStatus,
    default: ElectronicContractStatus.PENDING,
    comment: '전자계약 상태',
  })
  status: ElectronicContractStatus;

  @Column({ type: 'json', nullable: true, comment: '서명자 정보 (이름, 연락처, 이메일 등)' })
  signerInfo: any;

  @Column({ type: 'timestamp', nullable: true, comment: '서명 완료 일시' })
  signedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
