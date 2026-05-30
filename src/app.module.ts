import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { AuthModule } from './domains/auth/auth.module';
import { UsersModule } from './domains/users/users.module';
import { StoresModule } from './domains/stores/stores.module';
import { ContractsModule } from './domains/contracts/contracts.module';
import { ElectronicContractsModule } from './domains/electronic-contracts/electronic-contracts.module';
import { CrmModule } from './domains/crm/crm.module';
import { ConsultationsModule } from './domains/consultations/consultations.module';
import { PublicDataModule } from './infrastructure/public-data/public-data.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    // 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 어뷰징 방지 전역 설정 (기본: 분당 60회)
    ThrottlerModule.forRoot([
      {
        ttl: 60000,  // 1분 (ms)
        limit: 60,   // 기본 60회 (각 엔드포인트에서 @Throttle()로 오버라이드 가능)
      },
    ]),

    // 이벤트 에미터 (도메인 간 통신용)
    EventEmitterModule.forRoot(),

    // 스케줄러 설정 (Outbox 처리 및 백그라운드 작업용)
    ScheduleModule.forRoot(),

    // Redis 캐싱 모듈 설정 (Global)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          ttl: 60000, // 기본 60초 캐싱
        }),
      }),
    }),

    // 데이터베이스 모듈
    DatabaseModule,

    // 인프라 모듈
    PublicDataModule,

    // 도메인 모듈
    UsersModule,
    AuthModule,
    StoresModule,
    ContractsModule,
    ElectronicContractsModule,
    CrmModule,
    ConsultationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
