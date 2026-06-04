import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Device } from './entities/device.entity';
import { DeviceHistory } from './entities/device-history.entity';
import { Quote } from './entities/quote.entity';
import { GetDevicesQueryDto, SearchType, DeviceResponseDto } from './dto/get-devices.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { NetworkType, Carrier } from './entities/device.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QuoteCreatedEvent } from './events/quote-created.event';
import { EventOutbox, OutboxStatus } from './entities/event-outbox.entity';

@Injectable()
export class ConsultationsService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(DeviceHistory)
    private readonly deviceHistoryRepository: Repository<DeviceHistory>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(EventOutbox)
    private readonly outboxRepository: Repository<EventOutbox>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
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
      .leftJoinAndSelect('device.spec', 'spec')
      .where('device.networkType = :networkType', { networkType })
      .andWhere('device.carrier = :carrier', { carrier });

    if (keyword && searchType) {
      if (searchType === SearchType.DEVICE_NAME) {
        query.andWhere('device.deviceName LIKE :keyword', { keyword: `%${keyword}%` });
      } else if (searchType === SearchType.MODEL_NAME) {
        query.andWhere('device.modelName LIKE :keyword', { keyword: `%${keyword}%` });
      }
    }

    // 최신 출시일 순으로 정렬 (출시일이 같으면 최신 등록순)
    query.orderBy('device.releaseDate', 'DESC')
         .addOrderBy('device.id', 'DESC');

    const devices = await query.getMany();

    const result = devices.map((device: Device) => {
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
        releaseDate: device.releaseDate,
        principal,
        specs: device.spec || null,
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

    // Phase 2: Transaction for Outbox Pattern
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedQuote: Quote;
    try {
      const quote = queryRunner.manager.create(Quote, {
        quoteName,
        tag,
        networkType,
        carrier,
        deviceId: device.id,
        retailPrice: device.retailPrice,
        publicSubsidy: device.publicSubsidy,
        principal,
      });
      savedQuote = await queryRunner.manager.save(Quote, quote);

      const outbox = queryRunner.manager.create(EventOutbox, {
        eventType: 'quote.created',
        payload: { quote: savedQuote }, // 리스너에서 event.quote 형식으로 접근
      });
      await queryRunner.manager.save(EventOutbox, outbox);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // 직접적인 이벤트 발송 제거 (OutboxScheduler가 백그라운드에서 처리)
    return savedQuote;
  }

  // Phase 1: 크롤링 업데이트 시 단말기 이력(History) 테이블 분리 및 적재 (CDC 패턴)
  async upsertDeviceWithHistory(
    deviceId: string,
    retailPrice: number,
    publicSubsidy: number,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 단말기 가격 업데이트
      const device = await queryRunner.manager.findOne(Device, { where: { id: deviceId } });
      if (!device) {
        throw new NotFoundException('단말기를 찾을 수 없습니다.');
      }

      device.retailPrice = retailPrice;
      device.publicSubsidy = publicSubsidy;
      await queryRunner.manager.save(Device, device);

      // 2. 단말기 가격 이력을 History 테이블에 저장
      const history = queryRunner.manager.create(DeviceHistory, {
        deviceId: device.id,
        retailPrice,
        publicSubsidy,
      });
      await queryRunner.manager.save(DeviceHistory, history);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async seedDevices(): Promise<void> {
    await this.deviceHistoryRepository.createQueryBuilder().delete().execute();
    await this.deviceRepository.createQueryBuilder().delete().execute();

    const samsungModels = [
      { name: 'Galaxy S26 Ultra', model: 'SM-S948N', price: 1798400, sub: 500000, date: '2026-01-30' },
      { name: 'Galaxy S26+', model: 'SM-S946N', price: 1453000, sub: 450000, date: '2026-01-30' },
      { name: 'Galaxy S26', model: 'SM-S941N', price: 1255000, sub: 400000, date: '2026-01-30' },
      { name: 'Galaxy S25 Ultra', model: 'SM-S938N', price: 1698400, sub: 500000, date: '2025-01-30' },
      { name: 'Galaxy S25+', model: 'SM-S936N', price: 1353000, sub: 450000, date: '2025-01-30' },
      { name: 'Galaxy S25', model: 'SM-S931N', price: 1155000, sub: 400000, date: '2025-01-30' },
      { name: 'Galaxy Z Fold6', model: 'SM-F956N', price: 2229700, sub: 600000, date: '2024-07-24' },
      { name: 'Galaxy Z Flip6', model: 'SM-F741N', price: 1485000, sub: 550000, date: '2024-07-24' },
      { name: 'Galaxy S24 Ultra', model: 'SM-S928N', price: 1698400, sub: 600000, date: '2024-01-31' },
      { name: 'Galaxy S24+', model: 'SM-S926N', price: 1353000, sub: 500000, date: '2024-01-31' },
    ];

    const appleModels = [
      { name: 'iPhone 17 Pro Max', model: 'IP17-PM', price: 1900000, sub: 450000, date: '2025-09-20' },
      { name: 'iPhone 17 Pro', model: 'IP17-P', price: 1550000, sub: 400000, date: '2025-09-20' },
      { name: 'iPhone 17 Plus', model: 'IP17-PL', price: 1350000, sub: 350000, date: '2025-09-20' },
      { name: 'iPhone 17', model: 'IP17', price: 1250000, sub: 300000, date: '2025-09-20' },
      { name: 'iPhone 16 Pro Max', model: 'IP16-PM', price: 1900000, sub: 500000, date: '2024-09-20' },
      { name: 'iPhone 16 Pro', model: 'IP16-P', price: 1550000, sub: 450000, date: '2024-09-20' },
      { name: 'iPhone 16 Plus', model: 'IP16-PL', price: 1350000, sub: 400000, date: '2024-09-20' },
      { name: 'iPhone 16', model: 'IP16', price: 1250000, sub: 350000, date: '2024-09-20' },
      { name: 'iPhone 15 Pro Max', model: 'IP15-PM', price: 1750000, sub: 550000, date: '2023-09-22' },
      { name: 'iPhone 15 Pro', model: 'IP15-P', price: 1400000, sub: 500000, date: '2023-09-22' },
    ];

    const carriers = [Carrier.SKT, Carrier.KT, Carrier.LGU];
    const newDevices: any[] = [];

    for (const carrier of carriers) {
      for (const model of [...samsungModels, ...appleModels]) {
        newDevices.push(this.deviceRepository.create({
          networkType: NetworkType.WIRELESS,
          carrier,
          deviceName: model.name,
          modelName: model.model,
          retailPrice: model.price,
          publicSubsidy: model.sub,
          releaseDate: model.date,
        }));
      }
    }

    await this.deviceRepository.save(newDevices);
  }
}
