import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { UserTerm } from './user-term.entity';
import { Store } from '../../stores/entities/store.entity';
import { StoreStaff } from '../../stores/entities/store-staff.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ name: 'referral_code', unique: true })
  referralCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Relations
  @OneToOne(() => UserTerm, (term) => term.user, { cascade: true })
  terms: UserTerm;

  // OWNER 일 경우 여러 매장 소유
  @OneToMany(() => Store, (store) => store.owner)
  ownedStores: Store[];

  // STAFF 일 경우 매장 합류 (N:M 매핑)
  @OneToMany(() => StoreStaff, (storeStaff) => storeStaff.user)
  storeStaffs: StoreStaff[];
}
