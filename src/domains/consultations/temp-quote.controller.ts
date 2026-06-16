import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TempQuoteService } from './temp-quote.service';
import { CreateTempQuoteDto } from './dto/create-temp-quote.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Temp Quotes (임시 견적)')
@Controller('api/consultations/temp-quotes')
export class TempQuoteController {
  constructor(private readonly tempQuoteService: TempQuoteService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '임시 견적 등록 API', 
    description: '선택한 기기 정보를 바탕으로 임시 견적을 생성합니다.' 
  })
  @ApiResponse({ status: 201, description: '성공적으로 임시 견적을 생성했습니다.' })
  async createTempQuote(
    @Body() createTempQuoteDto: CreateTempQuoteDto,
    @CurrentUser() user: User
  ) {
    return this.tempQuoteService.createTempQuote(createTempQuoteDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '임시 견적 리스트 조회 API', 
    description: '로그인된 사용자가 보유한 조회 가능한 임시 견적 리스트를 반환합니다.' 
  })
  @ApiResponse({ status: 200, description: '성공적으로 리스트를 반환했습니다.' })
  async getTempQuotes(@CurrentUser() user: User) {
    return this.tempQuoteService.getTempQuotesByUser(user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '임시 견적 삭제 (비활성화)', description: '지정된 임시 견적의 isActive 플래그를 false로 변경합니다.' })
  @ApiResponse({ status: 200, description: '성공적으로 삭제 처리되었습니다.' })
  async deleteTempQuote(@Param('id') id: string, @CurrentUser() user: User) {
    await this.tempQuoteService.deactivateTempQuote(id, user.id);
    return { success: true, message: 'Deleted successfully' };
  }
}
