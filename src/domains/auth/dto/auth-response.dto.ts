import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: 'Owner registered successfully.' })
  message: string;

  @ApiProperty({ example: 'uuid-string' })
  userId: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}

export class ResetTokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  resetToken: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Password has been reset successfully.' })
  message: string;
}
