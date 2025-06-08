
import { Injectable } from '@nestjs/common';
import TradeEntity from 'src/entity/trade.entity';
import { Repository, DataSource, FindOptionsWhere, In } from 'typeorm';
import { OrderSide } from 'src/common/types';
import OrdersEntity from 'src/entity/order.entity';
import TokenEntity from 'src/entity/token.entity';

@Injectable()
export class TradeService {
  private readonly tradeRepository: Repository<TradeEntity>;
  private readonly ordersRepository: Repository<OrdersEntity>;
  private readonly tokenRepository: Repository<TokenEntity>;
  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.tradeRepository = this.dataSource.getRepository(TradeEntity);
    this.ordersRepository = this.dataSource.getRepository(OrdersEntity);
    this.tokenRepository = this.dataSource.getRepository(TokenEntity);
  }

  async getTradeList(page: number, marketId?: number, orderSide?: OrderSide, userAddress?: string) {
    const whereCondition: FindOptionsWhere<TradeEntity> = {};
    if (marketId != null) {
      whereCondition.marketId = marketId;
    }
    if (orderSide) {
      whereCondition.orderSide = orderSide;
    }
    if (userAddress) {
      whereCondition.bider = userAddress;
    }
    const pageSize = 20;
    const [list, count] = await this.tradeRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'DESC',
      },
      where: whereCondition,
    });
    const orderIds = list.map((item) => item.orderId);
    const orders = await this.ordersRepository.find({ where: { marketId, orderId: In(orderIds) }, select: ['orderId', 'orderStatus', 'isAskWithdrawed', 'isBidWithdrawed'] });
    const result = list.map((item) => {
      const order = orders.find((order) => order.orderId === item.orderId);
      return {
        ...item,
        orderStatus: order?.orderStatus,
        isAskWithdrawed: order?.isAskWithdrawed,
        isBidWithdrawed: order?.isBidWithdrawed,
      };
    });
    return { list: result, count, page, pageSize };
  }

  async getDistinctMarketIds(page: number, userAddress: string) {
    const pageSize = 10;
    const [result, { count }] = await Promise.all([
      this.tradeRepository
        .createQueryBuilder('trade')
        .select('DISTINCT(trade.marketId)', 'marketId')
        .andWhere('trade.bider = :userAddress', { userAddress })
        .orderBy('trade.marketId', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getRawMany(),
      this.tradeRepository
        .createQueryBuilder('trade')
        .select('COUNT(DISTINCT trade.marketId)', 'count')
        .andWhere('trade.bider = :userAddress', { userAddress })
        .getRawOne()
    ]);

    const marketIds = result.map((item) => Number(item.marketId));
    const list = await this.tokenRepository.find({ where: { marketId: In(marketIds) } });
    return { list, count: Number(count), page, pageSize };
  }
}
