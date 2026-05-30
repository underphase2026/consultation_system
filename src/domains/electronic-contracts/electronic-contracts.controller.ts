import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ElectronicContractsService } from './electronic-contracts.service';

@ApiTags('Electronic Contracts (서드파티 전자계약)')
@Controller('api/contracts/electronic')
export class ElectronicContractsController {
  constructor(private readonly electronicContractsService: ElectronicContractsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '서드파티 전자계약 웹훅 수신', description: '전자계약 상태 변경 이벤트를 비동기로 수신합니다.' })
  async handleWebhook(
    @Headers('x-signature') signature: string,
    @Body() payload: any,
  ) {
    await this.electronicContractsService.handleWebhook(payload, signature);
    // 웹훅 서비스에는 처리 성공 시 200 OK만 반환하면 됨
    return { success: true };
  }
}
