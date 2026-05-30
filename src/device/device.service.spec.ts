import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultationsService } from '../domains/consultations/consultations.service';
import { Device, NetworkType, Carrier } from '../domains/consultations/entities/device.entity';
import { Quote } from '../domains/consultations/entities/quote.entity';
import { SearchType } from '../domains/consultations/dto/get-devices.dto';

describe('Device Functionality (ConsultationsService.getDevices)', () => {
  let service: ConsultationsService;
  let deviceRepository: Repository<Device>;

  // TypeORM의 CreateQueryBuilder 체이닝을 Mocking하기 위한 객체 정의
  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationsService,
        {
          provide: getRepositoryToken(Device),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDevices', () => {
    it('기본 필터(networkType, carrier)만 적용했을 때 올바른 QueryBuilder를 생성하고 최근 등록 순으로 정렬한다.', async () => {
      // Given
      const queryDto = {
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
      };

      const mockDevices: Device[] = [
        {
          id: 'uuid-1',
          networkType: NetworkType.WIRELESS,
          carrier: Carrier.SKT,
          deviceName: 'Galaxy S24',
          modelName: 'SM-S921S',
          retailPrice: 1155000,
          publicSubsidy: 500000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockDevices);

      // When
      const result = await service.getDevices(queryDto);

      // Then
      expect(deviceRepository.createQueryBuilder).toHaveBeenCalledWith('device');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('device.networkType = :networkType', { networkType: NetworkType.WIRELESS });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('device.carrier = :carrier', { carrier: Carrier.SKT });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('device.id', 'DESC');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-1');
      expect(result[0].principal).toBe(655000); // 1,155,000 - 500,000 (할부원금 정확도 검증)
    });

    it('기종명(DEVICE_NAME) 검색 조건과 키워드가 제공되었을 때 LIKE 쿼리가 추가로 분기되는가?', async () => {
      // Given
      const queryDto = {
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        searchType: SearchType.DEVICE_NAME,
        keyword: 'iPhone',
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      // When
      await service.getDevices(queryDto);

      // Then
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'device.deviceName LIKE :keyword',
        { keyword: '%iPhone%' }
      );
    });

    it('모델명(MODEL_NAME) 검색 조건과 키워드가 제공되었을 때 LIKE 쿼리가 추가로 분기되는가?', async () => {
      // Given
      const queryDto = {
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        searchType: SearchType.MODEL_NAME,
        keyword: 'SM-G',
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);

      // When
      await service.getDevices(queryDto);

      // Then
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'device.modelName LIKE :keyword',
        { keyword: '%SM-G%' }
      );
    });

    it('할부원금(출고가 - 공시지원금)이 음수가 되는 경우, 0원으로 강제 조정(마이너스 방지)되는가?', async () => {
      // Given
      const queryDto = {
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
      };

      const mockDevices: Device[] = [
        {
          id: 'uuid-2',
          networkType: NetworkType.WIRELESS,
          carrier: Carrier.SKT,
          deviceName: 'Galaxy A15',
          modelName: 'SM-A155S',
          retailPrice: 319000,
          publicSubsidy: 400000, // 공시지원금이 출고가보다 높은 극단적 경우
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockDevices);

      // When
      const result = await service.getDevices(queryDto);

      // Then
      expect(result[0].principal).toBe(0); // 0원 보정 검증
    });
  });
});
