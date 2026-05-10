import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StoreStaff } from './store-staff.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({ name: 'store_business_name' })
  storeBusinessName: string;

  @Column({ name: 'store_name' })
  storeName: string;

  @Column({ name: 'business_registration_number', unique: true })
  businessRegistrationNumber: string;

  @Column()
  postcode: string;

  @Column({ name: 'detailed_address' })
  detailedAddress: string;

  @Column({ name: 'store_phone', nullable: true })
  storePhone: string;

  @Column({ name: 'store_code', unique: true })
  storeCode: string;

  @Column({ nullable: true })
  rate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.ownedStores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => StoreStaff, (storeStaff) => storeStaff.store)
  staffs: StoreStaff[];
}
