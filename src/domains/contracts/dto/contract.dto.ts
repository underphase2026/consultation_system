import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ example: 'uuid-string' })
  @IsUUID()
  storeId: string;

  @ApiProperty({ example: '김고객' })
  @IsString()
  customerName: string;

  @ApiProperty({ example: '01012345678' })
  @Matches(/^010\d{8}$/, { message: '올바른 휴대폰 번호를 입력하세요.' })
  customerPhone: string;
}

export class ContractResponseDto {
  @ApiProperty()
  contractId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  electronicContractId: string;
}
