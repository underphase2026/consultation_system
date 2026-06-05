import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { NetworkType, Carrier } from '../entities/device.entity';

export class CreateQuoteDto {
  @ApiProperty({ description: '유무선 구분', enum: NetworkType })
  @IsEnum(NetworkType)
  @IsNotEmpty()
  networkType: NetworkType;

  @ApiProperty({ description: '통신사', enum: Carrier })
  @IsEnum(Carrier)
  @IsNotEmpty()
  carrier: Carrier;

  @ApiProperty({ description: '선택된 단말기 ID' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ description: '매장 ID', required: false })
  @IsString()
  storeId?: string;
}
