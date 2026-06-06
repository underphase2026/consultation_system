import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TempQuote } from './entities/temp-quote.entity';
import { CreateTempQuoteDto } from './dto/create-temp-quote.dto';

@Injectable()
export class TempQuoteService {
  constructor(
    @InjectRepository(TempQuote)
    private readonly tempQuoteRepository: Repository<TempQuote>,
  ) {}

  /**
   * 임시 견적 등록
   */
  async createTempQuote(dto: CreateTempQuoteDto, userId: string): Promise<TempQuote> {
    const tempQuote = this.tempQuoteRepository.create({
      ...dto,
      userId,
      isActive: true,
    });
    return this.tempQuoteRepository.save(tempQuote);
  }

  /**
   * 유저 기반 활성화된 임시 견적 전체 조회
   */
  async getTempQuotesByUser(userId: string): Promise<TempQuote[]> {
    // Carrier는 Enum으로 관리되므로 relations 배열에 추가할 필요 없이 바로 접근 가능합니다.
    return this.tempQuoteRepository.find({
      where: { userId, isActive: true },
      relations: ['device'], // Device 엔티티 조인
      order: { createdAt: 'DESC' }, // 최신순 정렬
    });
  }

  /**
   * 임시 견적 논리적 삭제 (isActive = false)
   */
  async deactivateTempQuote(id: string, userId: string): Promise<void> {
    await this.tempQuoteRepository.update({ id, userId }, { isActive: false });
  }
}
