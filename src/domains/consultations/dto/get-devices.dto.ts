import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NetworkType, Carrier } from '../entities/device.entity';

export enum SearchType {
  DEVICE_NAME = 'DEVICE_NAME',
  MODEL_NAME = 'MODEL_NAME',
}

export class GetDevicesQueryDto {
  @ApiProperty({ description: '유무선 구분', enum: NetworkType })
  @IsEnum(NetworkType)
  networkType: NetworkType;

  @ApiProperty({ description: '통신사', enum: Carrier })
  @IsEnum(Carrier)
  carrier: Carrier;

  @ApiPropertyOptional({ description: '검색 조건 (기종명 또는 모델명)', enum: SearchType })
  @IsOptional()
  @IsEnum(SearchType)
  searchType?: SearchType;

  @ApiPropertyOptional({ description: '검색어' })
  @IsOptional()
  @IsString()
  keyword?: string;
}

export class DeviceResponseDto {
  @ApiProperty({ description: '단말기 ID' })
  id: string;

  @ApiProperty({ description: '유무선 구분', enum: NetworkType })
  networkType: NetworkType;

  @ApiProperty({ description: '통신사', enum: Carrier })
  carrier: Carrier;

  @ApiProperty({ description: '단말기 기종명' })
  deviceName: string;

  @ApiProperty({ description: '모델명' })
  modelName: string;

  @ApiProperty({ description: '출고가' })
  retailPrice: number;

  @ApiProperty({ description: '공시지원금' })
  publicSubsidy: number;

  @ApiProperty({ description: '할부원금 (출고가 - 공시지원금)' })
  principal: number;
}
