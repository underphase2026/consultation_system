import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({ example: '홍길동통신', description: '사업자등록증 상 상호명' })
  @IsString()
  storeBusinessName: string;

  @ApiProperty({ example: '홍길동 강남점', description: '매장 표시명' })
  @IsString()
  storeName: string;

  @ApiProperty({ example: '1234567890', description: '사업자 등록번호 (10자리, 하이픈 없이)' })
  @IsNumberString({}, { message: '사업자 등록번호는 숫자만 입력해주세요.' })
  @Length(10, 10, { message: '사업자 등록번호는 10자리여야 합니다.' })
  businessRegistrationNumber: string;

  @ApiProperty({ example: '06234', description: '우편번호' })
  @IsString()
  postcode: string;

  @ApiProperty({ example: '서울 강남구 테헤란로 123, 2층', description: '상세 주소' })
  @IsString()
  detailedAddress: string;

  @ApiPropertyOptional({ example: '0212345678', description: '매장 전화번호 (선택)' })
  @IsOptional()
  @IsString()
  @Matches(/^0[0-9]{1,2}[0-9]{3,4}[0-9]{4}$/, {
    message: '올바른 전화번호 형식이 아닙니다.',
  })
  storePhonenumber?: string;
}
