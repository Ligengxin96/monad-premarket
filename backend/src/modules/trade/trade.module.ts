import { Module } from '@nestjs/common';
import { TradeService } from './trade.service';
import { TradeController } from './trade.controller';

@Module({
  controllers: [TradeController],
  providers: [TradeService],
  exports: [TradeService],
})
export class TradeModule { }
