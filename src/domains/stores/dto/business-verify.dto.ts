import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class BusinessVerifyDto {
  @ApiProperty({
    example: '1234567890',
    description: '사업자등록번호 (10자리 숫자, 하이픈 제외)',
  })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: '사업자등록번호는 10자리 숫자여야 합니다.' })
  businessRegistrationNumber: string;
}
