import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { RedisService } from 'src/service/redis';
import { TradeModule } from '../trade/trade.module';
import { ConsulService } from 'src/service/consul.service';

@Module({
  imports: [TradeModule],
  controllers: [OrderController],
  providers: [RedisService, ConsulService, OrderService],
})
export class OrderModule { }
