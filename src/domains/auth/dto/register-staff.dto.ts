import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TermsDto } from './terms.dto';

export class RegisterStaffDto {
  @ApiProperty({ example: '김직원', description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ example: '01098765432', description: '휴대폰 번호' })
  @IsString()
  @Matches(/^01[0-9]{8,9}$/, { message: '올바른 휴대폰 번호 형식이 아닙니다.' })
  phoneNumber: string;

  @ApiProperty({ description: '휴대폰 인증 완료 여부 (true여야 가입 가능)' })
  @IsBoolean()
  isPhoneAuth: boolean;

  @ApiPropertyOptional({ example: 'staff@example.com', description: '이메일 (선택)' })
  @IsOptional()
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  email?: string;

  @ApiProperty({ example: 'Password1234!', description: '비밀번호 (최소 8자)' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;

  @ApiProperty({ type: TermsDto, description: '약관 동의' })
  @ValidateNested()
  @Type(() => TermsDto)
  terms: TermsDto;
}
