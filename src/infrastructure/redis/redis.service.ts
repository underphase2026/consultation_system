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

  /**
   * 키의 값을 1 증가시키고, 키가 처음 생성될 때만 TTL(초)을 설정합니다.
   * 일일 발송 횟수 제한 등에 사용됩니다.
   */
  async incrAndExpire(key: string, ttlSeconds: number): Promise<number> {
    const multi = this.client.multi();
    multi.incr(key);
    // 최초 생성 시에만 TTL 설정 (NX)
    multi.expire(key, ttlSeconds, 'NX');
    const results = await multi.exec();
    
    if (!results) {
      throw new Error('Redis multi execution failed');
    }
    
    // incr의 결과값을 반환
    return results[0][1] as number;
  }

  /**
   * 키의 값을 조회하여 expectedHash와 일치하면 원자적으로 삭제합니다. (Lua Script 활용)
   * Race Condition 방지에 사용됩니다.
   */
  async verifyAndDelete(key: string, expectedHash: string): Promise<boolean> {
    const luaScript = `
      local val = redis.call('GET', KEYS[1])
      if val == ARGV[1] then
        redis.call('DEL', KEYS[1])
        return 1
      else
        return 0
      end
    `;
    const result = await this.client.eval(luaScript, 1, key, expectedHash);
    return result === 1;
  }
}
