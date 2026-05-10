import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinStoreDto {
  @ApiProperty({ example: 'ABCD1234', description: '매장 합류 코드' })
  @IsString()
  @Length(1, 20)
  storeCode: string;
}
