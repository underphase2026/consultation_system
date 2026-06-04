import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity('device_specs')
export class DeviceSpec {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'device_id', unique: true, comment: '연결된 단말기 ID' })
  deviceId: string;

  @OneToOne(() => Device, device => device.spec, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ nullable: true, comment: 'CPU/AP 정보' })
  cpu: string;

  @Column({ nullable: true, comment: 'RAM 용량' })
  ram: string;

  @Column({ nullable: true, comment: '저장공간' })
  storage: string;

  @Column({ nullable: true, comment: '디스플레이 크기 및 패널' })
  display: string;

  @Column({ type: 'text', nullable: true, comment: '전/후면 카메라 화소' })
  camera: string;

  @Column({ nullable: true, comment: '배터리 용량' })
  battery: string;

  @Column({ nullable: true, comment: '기기 무게' })
  weight: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
