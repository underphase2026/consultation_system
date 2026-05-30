import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Device } from './device.entity';

@Entity('devices_history')
export class DeviceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @Index()
  @Column()
  deviceId: string;

  @Column({ type: 'int', comment: '스냅샷: 출고가' })
  retailPrice: number;

  @Column({ type: 'int', comment: '스냅샷: 공시지원금' })
  publicSubsidy: number;

  @CreateDateColumn({ comment: '변경(적재) 일시' })
  changedAt: Date;
}
