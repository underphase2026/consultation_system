import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConsultationsController } from './../src/domains/consultations/consultations.controller';
import { ConsultationsService } from './../src/domains/consultations/consultations.service';
import { Device, NetworkType, Carrier } from './../src/domains/consultations/entities/device.entity';
import { Quote } from './../src/domains/consultations/entities/quote.entity';
import { JwtAuthGuard } from './../src/common/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('Consultations API (e2e)', () => {
  let app: INestApplication;
  
  // JwtAuthGuard 통과/차단 여부를 제어할 전역 변수
  let mockGuardCanActivate = true;

  // TypeORM Device Repository Mocking
  const mockDeviceRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  };

  // TypeORM Quote Repository Mocking
  const mockQuoteRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  // JwtAuthGuard Custom Mocking (JWT 검증 없이 User 탑재 또는 가드 거부)
  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      if (!mockGuardCanActivate) {
        throw new UnauthorizedException();
      }
      const req = context.switchToHttp().getRequest();
      req.user = { id: 'test-user-uuid', email: 'test@example.com' };
      return true;
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ConsultationsController],
      providers: [
        ConsultationsService,
        {
          provide: getRepositoryToken(Device),
          useValue: mockDeviceRepository,
        },
        {
          provide: getRepositoryToken(Quote),
          useValue: mockQuoteRepository,
        },
      ],
    })
      // 인증 가드 오버라이드
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // validation 테스트를 위한 글로벌 파이프라인 등록
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    mockGuardCanActivate = true;
    jest.clearAllMocks();
  });

  describe('GET /api/consultations/devices', () => {
    it('인증 토큰 누락 시 401 Unauthorized 에러를 반환하는가?', async () => {
      mockGuardCanActivate = false;

      await request(app.getHttpServer())
        .get('/api/consultations/devices')
        .query({ networkType: NetworkType.WIRELESS, carrier: Carrier.SKT })
        .expect(401);
    });

    it('필수 파라미터(networkType) 누락 시 ValidationPipe에 의해 400 Bad Request 에러를 반환하는가?', async () => {
      await request(app.getHttpServer())
        .get('/api/consultations/devices')
        .query({ carrier: Carrier.SKT }) // networkType 미지정
        .expect(400);
    });

    it('올바른 요청 시 200 OK와 DTO 규격에 맞게 계산된 principal(할부원금)이 포함된 JSON 구조를 반환하는가?', async () => {
      const mockDevices = [
        {
          id: 'device-uuid-1',
          networkType: NetworkType.WIRELESS,
          carrier: Carrier.SKT,
          deviceName: 'Galaxy S24 Ultra',
          modelName: 'SM-S928S',
          retailPrice: 1698400,
          publicSubsidy: 600000,
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockDevices),
      };
      mockDeviceRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const response = await request(app.getHttpServer())
        .get('/api/consultations/devices')
        .query({ networkType: NetworkType.WIRELESS, carrier: Carrier.SKT })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toEqual({
        id: 'device-uuid-1',
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceName: 'Galaxy S24 Ultra',
        modelName: 'SM-S928S',
        retailPrice: 1698400,
        publicSubsidy: 600000,
        principal: 1098400, // 1698400 - 600000
      });
    });
  });

  describe('POST /api/consultations/quotes', () => {
    it('인증 토큰 누락 시 401 Unauthorized 에러를 반환하는가?', async () => {
      mockGuardCanActivate = false;

      await request(app.getHttpServer())
        .post('/api/consultations/quotes')
        .send({
          networkType: NetworkType.WIRELESS,
          carrier: Carrier.SKT,
          deviceId: 'device-uuid-1',
        })
        .expect(401);
    });

    it('필수 바디 파라미터(deviceId) 누락 시 ValidationPipe에 의해 400 Bad Request 에러를 반환하는가?', async () => {
      await request(app.getHttpServer())
        .post('/api/consultations/quotes')
        .send({
          networkType: NetworkType.WIRELESS,
          carrier: Carrier.SKT,
          // deviceId 누락
        })
        .expect(400);
    });

    it('DB에 없는 단말기 ID로 견적 생성 시 NotFoundException(404)을 반환하는가?', async () => {
      mockDeviceRepository.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/api/consultations/quotes')
        .send({
          networkType: NetworkType.WIRELESS,
          carrier: Carrier.SKT,
          deviceId: 'non-existent-device-id',
        })
        .expect(404);

      expect(response.body.message).toContain('단말기를 찾을 수 없습니다.');
    });

    it('단말기 통신사/유무선 정보가 DTO와 불일치 시 BadRequestException(400)을 반환하는가?', async () => {
      const mockDevice = {
        id: 'device-uuid-123',
        networkType: NetworkType.WIRED, // 유선 단말기
        carrier: Carrier.SKT,
        deviceName: '인터넷 홈팩',
        modelName: 'HN-100',
        retailPrice: 200000,
        publicSubsidy: 50000,
      };
      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);

      const response = await request(app.getHttpServer())
        .post('/api/consultations/quotes')
        .send({
          networkType: NetworkType.WIRELESS, // DTO는 무선
          carrier: Carrier.SKT,
          deviceId: 'device-uuid-123',
        })
        .expect(400);

      expect(response.body.message).toContain('단말기의 통신사 또는 유무선 정보가 일치하지 않습니다.');
    });

    it('정상 요청 시 201 Created와 생성된 견적서 JSON 구조를 반환하는가?', async () => {
      const mockDevice = {
        id: 'device-uuid-1',
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceName: 'iPhone 15 Pro',
        modelName: 'A3102',
        retailPrice: 1550000,
        publicSubsidy: 400000,
      };

      const mockSavedQuote = {
        id: 'quote-uuid-1234',
        quoteName: '[SKT] iPhone 15 Pro',
        tag: '무선',
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceId: 'device-uuid-1',
        retailPrice: 1550000,
        publicSubsidy: 400000,
        principal: 1150000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockDeviceRepository.findOne.mockResolvedValue(mockDevice);
      mockQuoteRepository.create.mockReturnValue(mockSavedQuote);
      mockQuoteRepository.save.mockResolvedValue(mockSavedQuote);

      const response = await request(app.getHttpServer())
        .post('/api/consultations/quotes')
        .send({
          networkType: NetworkType.WIRELESS,
          carrier: Carrier.SKT,
          deviceId: 'device-uuid-1',
        })
        .expect(201);

      expect(response.body).toEqual({
        id: 'quote-uuid-1234',
        quoteName: '[SKT] iPhone 15 Pro',
        tag: '무선',
        networkType: NetworkType.WIRELESS,
        carrier: Carrier.SKT,
        deviceId: 'device-uuid-1',
        retailPrice: 1550000,
        publicSubsidy: 400000,
        principal: 1150000,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});
