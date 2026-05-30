import { ApiProperty } from '@nestjs/swagger';

export class QuoteSummaryDto {
  @ApiProperty({ description: '견적 ID' })
  quoteId: string;

  @ApiProperty({ description: '견적명' })
  quoteName: string;

  @ApiProperty({ description: '기기명' })
  deviceName: string;

  @ApiProperty({ description: '단말기 할부원금' })
  principal: number;

  @ApiProperty({ description: '전자계약 ID (매핑된 경우)', required: false })
  contractId?: string;

  @ApiProperty({ description: '전자서명 상태', required: false })
  contractStatus?: string;

  @ApiProperty({ description: '연관된 CRM 고객 ID', required: false })
  crmCustomerId?: string;
}
