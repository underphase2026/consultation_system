import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GeocodeQueryDto {
  @ApiProperty({ example: '서울 강남구 테헤란로 123', description: '검색할 주소' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
