import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TradeService } from './trade.service';
import { User } from 'src/decorator';
import { OrderSide } from 'src/common/types';
import { AuthGuard } from 'src/guard/auth.guard';

@Controller({
  path: 'trade',
  version: '1',
})
export class TradeController {
  constructor(private readonly tradeService: TradeService) { }

  @Get('/list')
  async getTradeList(@Query() params: { page: number, marketId?: number, orderSide?: OrderSide }) {
    const { page, marketId, orderSide } = params;
    const result = await this.tradeService.getTradeList(page, marketId, orderSide);
    return result;
  }

  @Get('/list/my')
  @UseGuards(AuthGuard)
  async getMyTradeList(@User() userAddress: string, @Query() params: { page: number, marketId?: number, orderSide?: OrderSide }) {
    const { page, marketId, orderSide } = params;
    const result = await this.tradeService.getTradeList(page, marketId, orderSide, userAddress);
    return result;
  }

  @Get('/my/markets')
  async getMyMarketList(@User() userAddress: string, @Query() params: { page: number }) {
    const { page } = params;
    const result = await this.tradeService.getDistinctMarketIds(page, userAddress);
    return result;
  }
}
