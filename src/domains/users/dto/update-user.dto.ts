import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '홍길순', description: '이름' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '01099998888', description: '휴대폰 번호' })
  @IsOptional()
  @IsString()
  @Matches(/^01[0-9]{8,9}$/, { message: '올바른 휴대폰 번호 형식이 아닙니다.' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: '새 비밀번호 (최소 8자)' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password?: string;

  @ApiPropertyOptional({ description: '마케팅 수신 동의' })
  @IsOptional()
  @IsBoolean()
  marketingAgreed?: boolean;
}
