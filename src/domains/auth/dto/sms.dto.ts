import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

/** POST /auth/sms/send */
export class SendSmsDto {
  @ApiProperty({ example: '01012345678', description: '인증번호를 수신할 휴대폰 번호' })
  @IsString()
  @Matches(/^01[0-9]{8,9}$/, { message: '올바른 휴대폰 번호 형식이 아닙니다.' })
  phoneNumber: string;
}

/** POST /auth/sms/verify */
export class VerifySmsDto {
  @ApiProperty({ example: '01012345678', description: '휴대폰 번호' })
  @IsString()
  @Matches(/^01[0-9]{8,9}$/, { message: '올바른 휴대폰 번호 형식이 아닙니다.' })
  phoneNumber: string;

  @ApiProperty({ example: '382910', description: '수신한 6자리 인증번호' })
  @IsString()
  @Matches(/^[0-9]{6}$/, { message: '인증번호는 6자리 숫자여야 합니다.' })
  verificationCode: string;
}
