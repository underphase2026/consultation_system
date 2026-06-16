import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateDraftTabsDto {
  @ApiProperty({ description: '저장된 탭 배열 데이터 (JSON)' })
  @IsArray()
  tabsData: any[];

  @ApiProperty({ description: '현재 활성화된 탭 ID' })
  @IsString()
  activeTabId: string;
}
