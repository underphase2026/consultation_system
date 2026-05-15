import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      retryStrategy: () => null, // 개발 환경에서 Redis 없어도 로그 도배 안 되게 재연결 시도 방지
    });

    this.client.on('connect', () => this.logger.log('Redis 연결 성공'));
    this.client.on('error', (err) => this.logger.error('Redis 연결 오류', err));

    this.client.connect().catch((err) => {
      this.logger.warn(`Redis 연결 실패 (SMS 인증 기능 비활성화): ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * 키-값 쌍을 TTL(초)과 함께 저장합니다.
   */
  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  /**
   * 키로 값을 조회합니다. 존재하지 않으면 null 반환.
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * 키를 삭제합니다.
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Redis 연결 상태를 확인합니다.
   */
  isConnected(): boolean {
    return this.client.status === 'ready';
  }
}
