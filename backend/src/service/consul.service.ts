import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as assert from 'assert';
import Consul from 'consul';
import { ContractAddressConfigType } from 'src/common/types';

@Injectable()
export class ConsulService {
  private readonly consul: Consul;
  private readonly logger = new Logger(ConsulService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {
    const consulHost = this.configService.get<string>('CONSUL_HOST');
    assert.ok(consulHost, 'env variable CONSUL_HOST is not defined');
    this.consul = new Consul({
      host: consulHost,
      port: 8500,
    });
  }

  async getContractAddressConfig(): Promise<ContractAddressConfigType> {
    return this.getConsulValue<ContractAddressConfigType>('monand-premarket');
  }

  async getConsulValue<T>(key: string): Promise<T> {
    const result = await this.consul.kv.get(key);
    const { Value } = result;
    this.logger.log(`Get consul value success, key=${key}, Value=${Value}`);
    return JSON.parse(Value) as T;
  }
}
