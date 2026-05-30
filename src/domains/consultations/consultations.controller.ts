import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { GetDevicesQueryDto, DeviceResponseDto } from './dto/get-devices.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { Quote } from './entities/quote.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Consultations (통합 유무선 상담 및 견적)')
@Controller('api/consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '단말기 리스트 및 검색 API', 
    description: '조건에 맞는 단말기 목록과 계산된 가격(출고가, 공시지원금, 할부원금)을 반환합니다.' 
  })
  @ApiResponse({ status: 200, description: '성공적으로 단말기 목록을 반환했습니다.', type: [DeviceResponseDto] })
  async getDevices(@Query() queryDto: GetDevicesQueryDto): Promise<DeviceResponseDto[]> {
    return this.consultationsService.getDevices(queryDto);
  }

  @Post('quotes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '통합 견적 생성 API', 
    description: '선택한 단말기 정보를 바탕으로 현재 가격 스냅샷을 포함한 견적을 생성합니다.' 
  })
  @ApiResponse({ status: 201, description: '성공적으로 견적을 생성했습니다.', type: Quote })
  async createQuote(@Body() createQuoteDto: CreateQuoteDto): Promise<Quote> {
    return this.consultationsService.createQuote(createQuoteDto);
  }
}
