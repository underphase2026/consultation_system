import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { NetworkType, Carrier } from '../entities/device.entity';

export class CreateTempQuoteDto {
  @IsEnum(NetworkType)
  @IsNotEmpty()
  networkType: NetworkType;

  @IsEnum(Carrier)
  @IsNotEmpty()
  carrierId: Carrier;

  @IsUUID()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  deviceName: string;
}
