import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ApiTags('Search')
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '출결 검색 (관리자 전용)', description: 'ID와 Date를 사용하여 유저의 출결 정보를 검색합니다.' })
  @ApiQuery({ name: 'id', required: true, description: '유저 ID' })
  @ApiQuery({ name: 'date', required: true, description: '검색할 날짜 (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: '검색 결과 반환' })
  searchAttendance(@Query('id') id: string, @Query('date') date: string) {
    return { id, date, results: [] };
  }
}
