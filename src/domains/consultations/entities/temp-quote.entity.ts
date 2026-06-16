import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Device, Carrier, NetworkType } from './device.entity';

@Entity('temp_quotes')
export class TempQuote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'device_id' })
  deviceId: string;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  // 프로젝트 내에 Carrier 테이블이 없고 Enum으로 관리되므로 Enum 타입으로 매핑합니다.
  @Column({ type: 'enum', enum: Carrier, name: 'carrier_id', comment: '통신사 (Enum)' })
  carrierId: Carrier;

  @Column({ type: 'enum', enum: NetworkType, name: 'network_type', comment: '유무선 구분' })
  networkType: NetworkType;

  @Column({ name: 'device_name', comment: '기기명 (스냅샷/조인용)' })
  deviceName: string;

  @Column({ name: 'is_active', default: true, comment: '조회 가능 여부 플래그' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
