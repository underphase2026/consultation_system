import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './domains/auth/auth.module';
import { UsersModule } from './domains/users/users.module';
import { StoresModule } from './domains/stores/stores.module';
import { PublicDataModule } from './infrastructure/public-data/public-data.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    // 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 이벤트 에미터 (도메인 간 통신용)
    EventEmitterModule.forRoot(),

    // 데이터베이스 모듈
    DatabaseModule,

    // 인프라 모듈
    PublicDataModule,

    // 도메인 모듈
    UsersModule,
    AuthModule,
    StoresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
