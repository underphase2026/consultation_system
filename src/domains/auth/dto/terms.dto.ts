import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class TermsDto {
  @ApiProperty({ description: '이용 약관 동의 (필수, true여야 함)' })
  @IsBoolean()
  serviceAgreed: boolean;

  @ApiProperty({ description: '개인정보 수집 동의 (필수, true여야 함)' })
  @IsBoolean()
  privacyAgreed: boolean;

  @ApiPropertyOptional({ description: '마케팅 수신 동의 (선택)', default: false })
  @IsOptional()
  @IsBoolean()
  marketingAgreed?: boolean;
}
