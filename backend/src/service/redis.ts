import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as assert from 'assert';
import { Redis } from 'ioredis';
import { sleep } from '../utils';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redisClient: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    this.redisClient = new Redis(this.configService.get<string>('REDIS_URL'), { keyPrefix: this.configService.get('REDIS_PREFIX') || "pharos-permarket:" });
    this.logger.log(`Redis connect success, env: ${process.env.NODE_ENV}, keyPrefix: ${this.configService.get('REDIS_PREFIX') || "pharos-permarket:"}`);
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
    this.logger.log('Redis disconnect success');
  }

  newClient(keyPrefix = this.configService.get('REDIS_PREFIX') || "pharos-permarket:") {
    return new Redis(this.configService.get<string>('REDIS_URL'), { keyPrefix });
  }

  async setValue(key: string, value: string | number, ttlSeconds?: number) {
    return ttlSeconds
      ? this.redisClient.set(key, value, 'EX', ttlSeconds)
      : this.redisClient.set(key, value);
  }

  async setValueAndExpireAt(key: string, expirationTimestamp: number, value: string | number) {
    return this.redisClient.set(key, value, 'EXAT', expirationTimestamp);
  }

  async getValue(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async deleteKey(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  async lock(redisKey: string, ttlSeconds = 60) {
    assert.ok(redisKey, 'redisKey is required');
    assert.ok(ttlSeconds, 'ttlSeconds is required');
    while (true) {
      const lock = await this.redisClient.set(redisKey, 1, 'EX', ttlSeconds, 'NX');
      if (lock === 'OK') {
        break;
      } else {
        await sleep(100);
      }
    }
    return () => this.deleteKey(redisKey);
  }

  async setValueNX(key: string, value: string | number, ttlSeconds: number) {
    return this.redisClient.set(key, value, 'EX', ttlSeconds, 'NX');
  }
}
