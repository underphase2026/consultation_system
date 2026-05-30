import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateElectronicContractDto {
  @ApiProperty({ description: '생성된 견적(Quote)의 ID' })
  @IsUUID()
  @IsNotEmpty()
  quoteId: string;

  @ApiProperty({ description: '고객명' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ description: '고객 연락처' })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiProperty({ description: '매장 ID (해당 견적과 연관된 매장)', required: false })
  @IsUUID()
  @IsOptional()
  storeId?: string;
}
