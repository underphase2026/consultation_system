import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { Quote } from './entities/quote.entity';
import { GetDevicesQueryDto, SearchType, DeviceResponseDto } from './dto/get-devices.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { NetworkType } from './entities/device.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuoteCreatedEvent } from './events/quote-created.event';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getDevices(queryDto: GetDevicesQueryDto): Promise<DeviceResponseDto[]> {
    const { networkType, carrier, searchType, keyword } = queryDto;

    // 캐시 키 생성 (검색 조건 결합)
    const cacheKey = `devices:${networkType}:${carrier}:${searchType || 'all'}:${keyword || 'none'}`;
    const cachedData = await this.cacheManager.get<DeviceResponseDto[]>(cacheKey);
    
    if (cachedData) {
      return cachedData; // 캐시 히트 시 즉시 반환
    }

    const query = this.deviceRepository.createQueryBuilder('device')
      .where('device.networkType = :networkType', { networkType })
      .andWhere('device.carrier = :carrier', { carrier });

    if (keyword && searchType) {
      if (searchType === SearchType.DEVICE_NAME) {
        query.andWhere('device.deviceName LIKE :keyword', { keyword: `%${keyword}%` });
      } else if (searchType === SearchType.MODEL_NAME) {
        query.andWhere('device.modelName LIKE :keyword', { keyword: `%${keyword}%` });
      }
    }

    // 최근 추가된 단말기 순으로 정렬
    query.orderBy('device.id', 'DESC');

    const devices = await query.getMany();

    const result = devices.map(device => {
      // 서버 단에서 할부원금 계산 (마이너스 방지)
      const principal = Math.max(0, device.retailPrice - device.publicSubsidy);

      return {
        id: device.id,
        networkType: device.networkType,
        carrier: device.carrier,
        deviceName: device.deviceName,
        modelName: device.modelName,
        retailPrice: device.retailPrice,
        publicSubsidy: device.publicSubsidy,
        principal,
      };
    });

    // 검색 결과를 캐시에 저장 (60초 TTL) - NestJS Cache-Manager v5+ 스펙 호환용 숫자
    await this.cacheManager.set(cacheKey, result, 60000);

    return result;
  }

  async createQuote(dto: CreateQuoteDto): Promise<Quote> {
    const { networkType, carrier, deviceId } = dto;

    const device = await this.deviceRepository.findOne({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('단말기를 찾을 수 없습니다.');
    }

    if (device.networkType !== networkType || device.carrier !== carrier) {
      throw new BadRequestException('단말기의 통신사 또는 유무선 정보가 일치하지 않습니다.');
    }

    const principal = Math.max(0, device.retailPrice - device.publicSubsidy);
    const quoteName = `[${device.carrier}] ${device.deviceName}`;
    const tag = networkType === NetworkType.WIRED ? '유선' : '무선';

    const quote = this.quoteRepository.create({
      quoteName,
      tag,
      networkType,
      carrier,
      deviceId: device.id,
      retailPrice: device.retailPrice,
      publicSubsidy: device.publicSubsidy,
      principal,
    });

    const savedQuote = await this.quoteRepository.save(quote);

    // 이벤트 발송 (CRM 등 타 도메인과 격리된 비동기 통신)
    this.eventEmitter.emit('quote.created', new QuoteCreatedEvent(savedQuote));

    return savedQuote;
  }
}
