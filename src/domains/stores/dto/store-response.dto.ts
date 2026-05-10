import { ApiProperty } from '@nestjs/swagger';

export class StoreItemResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  storeId: string;

  @ApiProperty({ example: '홍길동 강남점' })
  storeName: string;

  @ApiProperty({ example: '서울 강남구 테헤란로 123, 2층' })
  address: string;

  @ApiProperty({ example: '프리미엄 요금제', required: false })
  rate?: string;

  @ApiProperty({ example: '홍길동' })
  ownerName: string;

  @ApiProperty({ example: '0212345678' })
  phoneNumber: string;
}

export class CreateStoreResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  storeId: string;

  @ApiProperty({ example: '홍길동 강남점' })
  storeName: string;

  @ApiProperty({ example: 'ABCD1234' })
  storeCode: string;
}

export class JoinStoreResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  storeId: string;

  @ApiProperty({ example: '홍길동 강남점' })
  storeName: string;
}
