import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class BusinessVerifyDto {
  @ApiProperty({
    example: '1234567890',
    description: '사업자등록번호 (어떤 형태든 입력 가능)',
  })
  @IsString()
  @IsNotEmpty({ message: '사업자등록번호를 입력해주세요.' })
  businessRegistrationNumber: string;
}
