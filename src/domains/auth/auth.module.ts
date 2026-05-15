import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtResetStrategy } from './strategies/jwt-reset.strategy';
import { UsersModule } from '../users/users.module';
// import { RedisModule } from '../../infrastructure/redis/redis.module'; // SMS 인증 비활성화
// import { SmsModule } from '../../infrastructure/sms/sms.module'; // SMS 인증 비활성화

@Module({
  imports: [
    UsersModule,
    // RedisModule, // SMS 인증 비활성화
    // SmsModule, // SMS 인증 비활성화
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'fallback-secret'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtResetStrategy,
    // ThrottlerGuard를 AuthModule 전역이 아닌 컨트롤러 레벨에서 적용
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
