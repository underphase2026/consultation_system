import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ConsultationsService } from '../domains/consultations/consultations.service';
import { Device, NetworkType, Carrier } from '../domains/consultations/entities/device.entity';
import { Quote } from '../domains/consultations/entities/quote.entity';

describe('Quote Functionality (ConsultationsService.createQuote)', () => {
  let service: ConsultationsService;
  let deviceRepository: Repository<Device>;
  let quoteRepository: Repository<Quote>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationsService,
        {
          provide: getRepositoryToken(Device),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Quote),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConsultationsService>(ConsultationsService);
    deviceRepository = module.get<Repository<Device>>(getRepositoryToken(Device));
    quoteRepository = module.get<Repository<Quote>>(getRepositoryToken(Quote));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuote', () => {
    it('단말기 DB 조회가 실패(미존재)하면 NotFoundException(404)을 발생시킨다.', async () => {
      // Given
      const dto = {
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceId: 'non-existent-uuid',
      };

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(null);

      // When & Then
      await expect(service.createQuote(dto)).rejects.toThrow(NotFoundException);
      expect(deviceRepository.findOne).toHaveBeenCalledWith({ where: { id: 'non-existent-uuid' } });
    });

    it('단말기 정보(통신사/유무선)가 요청 DTO와 불일치하면 BadRequestException(400)을 발생시킨다.', async () => {
      // Given
      const dto = {
        networkType: NetworkType.WIRELESS, // 무선 요청
        carrier: Carrier.SKT,              // SKT 요청
        deviceId: 'uuid-1',
      };

      const mockDevice: Device = {
        id: 'uuid-1',
        networkType: NetworkType.WIRED,    // 유선 단말기 (유무선 불일치)
        carrier: Carrier.SKT,
        deviceName: '인터넷 홈팩',
        modelName: 'HN-100',
        retailPrice: 200000,
        publicSubsidy: 50000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(mockDevice);

      // When & Then
      await expect(service.createQuote(dto)).rejects.toThrow(BadRequestException);
    });

    it('성공 시 견적명([carrier] + [deviceName])과 태그(무선/유선)를 조합하고 가격 스냅샷을 포함하여 저장한다.', async () => {
      // Given
      const dto = {
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceId: 'uuid-1',
      };

      const mockDevice: Device = {
        id: 'uuid-1',
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceName: 'iPhone 15 Pro',
        modelName: 'A3102',
        retailPrice: 1550000,
        publicSubsidy: 400000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQuote = {
        id: 'quote-uuid-1',
        quoteName: '[SKT] iPhone 15 Pro',
        tag: '무선',
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceId: 'uuid-1',
        retailPrice: 1550000,
        publicSubsidy: 400000,
        principal: 1150000,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Quote;

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(mockDevice);
      jest.spyOn(quoteRepository, 'create').mockReturnValue(mockQuote);
      jest.spyOn(quoteRepository, 'save').mockResolvedValue(mockQuote);

      // When
      const result = await service.createQuote(dto);

      // Then
      expect(quoteRepository.create).toHaveBeenCalledWith({
        quoteName: '[SKT] iPhone 15 Pro', // 백엔드 자동 조합
        tag: '무선',                     // WIRELESS이므로 '무선' 태그 자동 매핑
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceId: 'uuid-1',
        retailPrice: 1550000,            // 가격 스냅샷 저장
        publicSubsidy: 400000,           // 가격 스냅샷 저장
        principal: 1150000,              // 할부원금 계산 스냅샷 저장
      });

      expect(quoteRepository.save).toHaveBeenCalledWith(mockQuote);
      expect(result).toEqual(mockQuote);
    });

    it('성공 시 유선 단말기에 대해 올바르게 태그(유선)를 조합하는가?', async () => {
      // Given
      const dto = {
        networkType: NetworkType.WIRED,
        carrier: Carrier.KT,
        deviceId: 'uuid-wired',
      };

      const mockDevice: Device = {
        id: 'uuid-wired',
        networkType: NetworkType.WIRED,
        carrier: Carrier.KT,
        deviceName: 'GiGA WiFi home ax',
        modelName: 'KM-200',
        retailPrice: 150000,
        publicSubsidy: 150000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockQuote = {
        id: 'quote-uuid-wired',
        quoteName: '[KT] GiGA WiFi home ax',
        tag: '유선',
        networkType: NetworkType.WIRED,
        carrier: Carrier.KT,
        deviceId: 'uuid-wired',
        retailPrice: 150000,
        publicSubsidy: 150000,
        principal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Quote;

      jest.spyOn(deviceRepository, 'findOne').mockResolvedValue(mockDevice);
      jest.spyOn(quoteRepository, 'create').mockReturnValue(mockQuote);
      jest.spyOn(quoteRepository, 'save').mockResolvedValue(mockQuote);

      // When
      await service.createQuote(dto);

      // Then
      expect(quoteRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          quoteName: '[KT] GiGA WiFi home ax',
          tag: '유선', // WIRED이므로 '유선' 태그 자동 매핑
          principal: 0,
        })
      );
    });
  });
});
