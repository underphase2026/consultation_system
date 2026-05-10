import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/enums/role.enum';

export class UserProfileResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: '01012345678' })
  phoneNumber: string;

  @ApiProperty({ example: '홍길동' })
  name: string;

  @ApiProperty({ example: 'test@example.com', required: false })
  email?: string;

  @ApiProperty({ enum: Role, example: Role.OWNER })
  role: Role;

  @ApiProperty({ example: 'ABCDEF' })
  referralCode: string;
}
