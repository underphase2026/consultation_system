import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_tabs')
export class UserTabs {
  @PrimaryColumn({ name: 'user_id', comment: '사용자 ID' })
  userId: string;

  @Column({ type: 'json', comment: '저장된 탭 배열 데이터' })
  tabsData: any;

  @Column({ name: 'active_tab_id', comment: '활성화된 탭 ID' })
  activeTabId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
