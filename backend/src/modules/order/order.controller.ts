import { Body, Controller, Get, Logger, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderSide, OrderStatus, PriceSort } from 'src/common/types';
import { AuthGuard } from 'src/guard/auth.guard';
import { User } from 'src/decorator';

@Controller({
  path: 'order',
  version: '1',
})
export class OrderController {
  private readonly logger = new Logger(OrderController.name);
  constructor(
    private readonly orderService: OrderService,
  ) { }

  @Get('/list')
  async getOrderList(@Query() params: { page: number, symbol?: string, orderSide?: OrderSide, minPrice?: number, maxPrice?: number, priceSort?: PriceSort, marketId?: number, orderStatus?: OrderStatus }) {
    const { page, symbol, orderSide, minPrice, maxPrice, priceSort, marketId, orderStatus = OrderStatus.Open } = params;
    const result = await this.orderService.getOrderList(page, symbol, orderSide, minPrice, maxPrice, priceSort, orderStatus, marketId);
    return result;
  }

  @Get('/my')
  @UseGuards(AuthGuard)
  async getMyOrderList(@User() userAddress: string, @Query() params: { page: number, symbol?: string, orderSide?: OrderSide, minPrice?: number, maxPrice?: number, priceSort?: PriceSort, marketId?: number, orderStatus?: OrderStatus }) {
    const { page, symbol, orderSide, minPrice, maxPrice, priceSort, marketId, orderStatus } = params;
    const result = await this.orderService.getOrderList(page, symbol, orderSide, minPrice, maxPrice, priceSort, orderStatus, marketId, userAddress);
    return result;
  }

  @Get('/my/markets')
  @UseGuards(AuthGuard)
  async getMyMarketList(@User() userAddress: string, @Query() params: { page: number }) {
    const { page } = params;
    const result = await this.orderService.getDistinctMarketIds(page, userAddress);
    return result;
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  async create(@User() userAddress: string, @Body() params: { marketId: number, orderId: string }) {
    const { marketId, orderId } = params;
    this.logger.log(`User=${userAddress} create order, marketId=${marketId}, orderId=${orderId}`);
    const order = await this.orderService.create(userAddress, marketId, orderId);
    this.logger.log(`User=${userAddress} create order success, marketId=${marketId}, orderId=${orderId}`);
    return { order };
  }

  @Post('/bid')
  @UseGuards(AuthGuard)
  async bid(@User() userAddress: string, @Body() params: { marketId: number, orderIds: string[], hash: string }) {
    const { marketId, orderIds, hash } = params;
    this.logger.log(`User=${userAddress} bid order, marketId=${marketId}, orderIds=${orderIds.join(',')}`);
    await this.orderService.validateMarketEndTime(marketId);
    const orderId = await this.orderService.bid(userAddress, marketId, orderIds, hash);
    this.logger.log(`User=${userAddress} bid order success, marketId=${marketId}, orderIds=${orderIds.join(',')}`);
    return { orderId };
  }
}
