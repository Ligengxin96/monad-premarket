import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderStatus, OrderSide, PriceSort, OrderType, EventName, MarketConfig, OrderInfo, MarketInfo } from 'src/common/types';
import OrdersEntity from 'src/entity/order.entity';
import { sleep } from 'src/utils';
import { Repository, DataSource, Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere, In } from 'typeorm';
import CollateralEntity from 'src/entity/collateral.entity';
import { ethers, JsonRpcProvider } from 'ethers';
import { GovernanceAbi, SimpleMarketCoreInterface, SimpleFactoryAbi, HelperAbi } from 'src/common/contracts';
import { BizErrorCode, BizException } from 'src/constant';
import dayjs from 'dayjs';
import { RedisService } from 'src/service/redis';
import TokenEntity from 'src/entity/token.entity';
import TradeEntity from 'src/entity/trade.entity';
import { BigNumber } from 'bignumber.js';
import { TradeService } from '../trade/trade.service';
import { ConsulService } from 'src/service/consul.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private readonly ordersRepository: Repository<OrdersEntity>;
  private readonly collateralRepository: Repository<CollateralEntity>;
  private readonly tokenRepository: Repository<TokenEntity>;
  constructor(
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
    private readonly tradeService: TradeService,
    private readonly consulService: ConsulService,
  ) {
    this.ordersRepository = this.dataSource.getRepository(OrdersEntity);
    this.collateralRepository = this.dataSource.getRepository(CollateralEntity);
    this.tokenRepository = this.dataSource.getRepository(TokenEntity);
  }

  async getOrderList(page: number, symbol: string, orderSide?: OrderSide, minPrice?: number, maxPrice?: number, priceSort?: PriceSort, orderStatus?: OrderStatus, marketId?: number, userAddress?: string) {
    const pageSize = 10;
    const whereCondition: FindOptionsWhere<OrdersEntity> = {};
    let order: any = {
      id: 'DESC',
    };
    if (priceSort) {
      order = {
        price: priceSort,
      };
    }
    if (symbol) {
      whereCondition.symbol = symbol;
    }
    if (marketId != null) {
      whereCondition.marketId = marketId;
    }
    if (orderSide) {
      whereCondition.orderSide = orderSide;
    }
    if (orderStatus) {
      whereCondition.orderStatus = orderStatus;
    }
    if (userAddress) {
      whereCondition.userAddress = userAddress;
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      whereCondition.price = Between(minPrice.toString(), maxPrice.toString());
    } else if (minPrice !== undefined) {
      whereCondition.price = MoreThanOrEqual(minPrice.toString());
    } else if (maxPrice !== undefined) {
      whereCondition.price = LessThanOrEqual(maxPrice.toString());
    }

    const [list, count] = await this.ordersRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order,
      where: whereCondition,
    });
    return { list, count, page, pageSize };
  }

  async create(userAddress: string, marketId: number, orderId: string) {
    const retry = 3;
    for (let i = 0; i < retry; i++) {
      const release = await this.redisService.lock(`createOrderLock:${marketId}:${orderId}`);
      try {

        const existOrder = await this.ordersRepository.findOneBy({ marketId, orderId });
        if (existOrder) {
          this.logger.warn(`MarketId=${marketId} orrderid=${orderId} already exists`);
          return existOrder;
        } else {
          const { collateralAddress, endTime } = await this.getMarketConfig(marketId);
          if (endTime !== 0 && dayjs().isAfter(dayjs.unix(endTime).subtract(12, 'h'))) {
            throw new BizException(BizErrorCode.MarketEnd);
          }
          const [[orderInfo], { symbol }, { symbol: collateral }] = await Promise.all([
            this.getOrdersInfo(marketId, [orderId]),
            this.tokenRepository.findOneByOrFail({ marketId }),
            this.collateralRepository.findOneByOrFail({ address: collateralAddress }),
          ]);
          if (orderInfo.state !== OrderStatus.Open) {
            this.logger.warn(`OrderId=${orderId} status is not open, status=${orderInfo.state}`);
            const lastOrderId = await this.getLastestOrderId(marketId);
            if (BigInt(orderId) >= BigInt(lastOrderId) || BigInt(orderId) < 0n) {
              throw new BizException(BizErrorCode.OrderNotExist);
            }
          }
          const order: Partial<OrdersEntity> = {
            orderId,
            orderSide: orderInfo.orderType,
            orderType: OrderType.Full,
            symbol,
            price: orderInfo.price,
            amount: orderInfo.amount,
            orderStatus: orderInfo.state,
            userAddress: orderInfo.creator,
            isAskWithdrawed: orderInfo.creatorWithdrawed,
            isBidWithdrawed: orderInfo.traderWithdrawed,
            collateral,
            collateralAddress,
            createdAt: dayjs.unix(Number(orderInfo.creationTime)).toDate(),
            marketId,
          };
          await this.ordersRepository.insert(order);
          const createOrder = await this.ordersRepository.findOneByOrFail({ marketId, orderId });
          const now = dayjs().unix();
          return orderInfo;
        }
      } catch (error) {
        if (i === retry - 1) {
          this.logger.error(`User=${userAddress} failed to create order, marketId=${marketId}, orderId=${orderId}. ${error}`);
          throw error;
        }
        await sleep(1000);
      } finally {
        await release();
      }
    }
  }

  async bid(userAddress: string, marketId: number, orderIds: string[], hash: string) {
    const retry = 3;
    const release = await this.redisService.lock(orderIds.length === 1 ? `updateOrder:${marketId}:${orderIds[0]}` : `updateOrder:${marketId}:${userAddress}`);
    try {
      for (let i = 0; i < retry; i++) {
        try {
          const orders = await this.getOrdersInfo(marketId, orderIds);
          const trades = await this.bidOrder(marketId, orders, hash)
          return trades;
        } catch (error) {
          if (i === retry - 1) {
            this.logger.error(`User=${userAddress} failed to bid order, marketId=${marketId}, orderIds=${orderIds.join(',')}. ${error}`);
            throw error;
          }
          await sleep(1000);
        }
      }
    } finally {
      await release();
    }
  }

  async bidOrder(marketId: number, orders: OrderInfo[], hash: string) {
    const orderIds = [];
    const bidOrders = [];
    for (const order of orders) {
      if (order.state === OrderStatus.Filled) {
        orderIds.push(order.orderId);
        bidOrders.push(order);
      } else {
        this.logger.warn(`Order=${order.orderId} status is not filled, status=${order.state}`);
      }
    }
    const existOrders = await this.ordersRepository.find({ where: { marketId, orderId: In(orderIds) } });
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const trades = [];
      const timestamp = dayjs().unix();
      for (let i = 0; i < bidOrders.length; i++) {
        const orderInfo = bidOrders[i];
        const orderId = orderInfo.orderId;
        const existOrder = existOrders.find((order) => order.orderId === orderId);
        const collateralAmount = BigNumber(orderInfo.amount).multipliedBy(orderInfo.price).toFixed();
        const trade: Partial<TradeEntity> = {
          orderId,
          orderSide: existOrder.orderSide,
          asker: orderInfo.creator,
          bider: orderInfo.trader,
          symbol: existOrder.symbol,
          price: orderInfo.price,
          amount: orderInfo.amount,
          collateralAmount,
          collateral: existOrder.collateral,
          collateralAddress: existOrder.collateralAddress,
          marketId,
          timestamp,
          hash,
        };
        trades.push(trade);
      }
      await queryRunner.manager.insert(TradeEntity, trades);
      await queryRunner.manager.update(OrdersEntity, { marketId, orderId: In(orderIds) }, { orderStatus: OrderStatus.Filled });
      await queryRunner.commitTransaction();
      return trades;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async validateHashIsSuccess(hash: string) {
    const provider = new JsonRpcProvider(`https://testnet-rpc.monad.xyz`);
    const receipt = await provider.getTransactionReceipt(hash)
    if (receipt.status !== 1) {
      this.logger.error(`Transaction ${hash} failed`);
      throw new BizException(BizErrorCode.ValidateHashError);
    }
    return receipt;
  }

  private async getOrderInfoByHash(hash: string) {
    try {
      const receipt = await this.validateHashIsSuccess(hash);
      for (const log of receipt.logs) {
        try {
          const parsedLog = SimpleMarketCoreInterface.parseLog(log);
          if (parsedLog.name === EventName.CreateOrder) {
            const { args } = parsedLog;
            const [id] = args;
            const orderId: string = id.toString();
            const now = dayjs().unix();
            return orderId;
          }
        } catch (error) {
          this.logger.warn(`Parse Log failed, hash=${hash}. ${error}`);
          continue;
        }
      }
      throw new BizException(BizErrorCode.ValidateHashError);
    } catch (error) {
      this.logger.error(`Failed to get order info from transaction ${hash}. ${error}`);
      throw new BizException(BizErrorCode.ValidateHashError);
    }
  }

  private async getMarketConfig(marketId: number): Promise<MarketConfig> {
    const { Governance } = await this.consulService.getContractAddressConfig();
    const provider = new JsonRpcProvider(`https://testnet-rpc.monad.xyz`);
    const governanceContract = new ethers.Contract(Governance, GovernanceAbi, provider);
    const [tokenAddress, collateralAddress, endTime] = await governanceContract.getMarketConfig(marketId);
    this.logger.log(`GetMarketConfig success, marketId=${marketId}, tokenAddress=${tokenAddress}, collateralAddress=${collateralAddress}, endTime=${endTime}`);
    const result = {
      tokenAddress: tokenAddress as string,
      collateralAddress: collateralAddress as string,
      endTime: Number(endTime.toString()),
    };
    const token = await this.tokenRepository.findOneByOrFail({ marketId });
    if (token.endTime !== result.endTime) {
      await this.tokenRepository.update({ marketId }, { endTime: result.endTime });
      this.logger.log(`Update token endTime success, marketId=${marketId}, endTime=${result.endTime}`);
    }
    return result;
  }

  private getOrderStatus(state: string): OrderStatus {
    switch (state) {
      case '0':
        return OrderStatus.Canceled;
      case '1':
        return OrderStatus.Open;
      case '2':
        return OrderStatus.Filled;
      case '3':
        return OrderStatus.Refund;
      case '4':
        return OrderStatus.Absenteeism;
      case '5':
        return OrderStatus.Done;
      default:
        throw new Error(`Unknown order state=${state}`);
    }
  }

  async validateMarketEndTime(marketId: number) {
    const marketConfig = await this.getMarketConfig(marketId);
    const { endTime } = marketConfig;
    if (endTime !== 0 && dayjs().isAfter(dayjs.unix(endTime).subtract(12, 'h'))) {
      throw new BizException(BizErrorCode.MarketEnd);
    }
    return marketConfig;
  }

  private async getOrdersInfo(marketId: number, orderIds: string[]): Promise<OrderInfo[]> {
    const { Helper } = await this.consulService.getContractAddressConfig();
    const provider = new JsonRpcProvider(`https://testnet-rpc.monad.xyz`);
    const helperContract = new ethers.Contract(Helper, HelperAbi, provider);
    const [orderStatus, orderInfos] = await helperContract.getOrdersInfo(marketId, orderIds);
    this.logger.log(`GetOrdersInfo success, marketId=${marketId}, orderIds=${orderIds.join(',')}, orderStatus=${orderStatus.join(',')}`);
    const result: OrderInfo[] = [];
    for (let i = 0; i < orderIds.length; i++) {
      const orderId = orderIds[i];
      const [orderType, , creatorWithdrawState, traderWithdrawState, trader, creator, price, amount, doneAmount, creationTime] = orderInfos[i];
      result.push({
        orderId,
        orderType: orderType.toString() === '0' ? OrderSide.Buy : OrderSide.Sell,
        state: this.getOrderStatus(orderStatus[i].toString()),
        creatorWithdrawed: creatorWithdrawState !== '0x00',
        traderWithdrawed: traderWithdrawState !== '0x00',
        trader: trader as string,
        creator: creator as string,
        amount: ethers.formatUnits(amount, 6).toString() as string,
        doneAmount: ethers.formatUnits(doneAmount, 6).toString() as string,
        price: ethers.formatUnits(price, 6).toString() as string,
        creationTime: creationTime.toString() as string,
      });
    }
    return result;
  }

  private async getLastestOrderId(marketId: number): Promise<string> {
    const { Helper } = await this.consulService.getContractAddressConfig();
    const provider = new JsonRpcProvider(`https://testnet-rpc.monad.xyz`);
    const helperContract = new ethers.Contract(Helper, HelperAbi, provider);
    const lastOrderId = await helperContract.getLastestOrderId(marketId);
    this.logger.log(`Get marketId=${marketId} lastest orderId=${lastOrderId}`);
    return lastOrderId.toString()
  }

  async getDistinctMarketIds(page: number, userAddress: string) {
    const pageSize = 10;
    const [result, { count }] = await Promise.all([
      this.ordersRepository
        .createQueryBuilder('orders')
        .select('DISTINCT(orders.marketId)', 'marketId')
        .andWhere('orders.userAddress = :userAddress', { userAddress })
        .orderBy('orders.marketId', 'DESC')
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getRawMany(),
      this.ordersRepository
        .createQueryBuilder('orders')
        .select('COUNT(DISTINCT orders.marketId)', 'count')
        .andWhere('orders.userAddress = :userAddress', { userAddress })
        .getRawOne()
    ]);

    const marketIds = result.map((item) => Number(item.marketId));
    const markets = [];
    const list = await this.tokenRepository.find({ where: { marketId: In(marketIds) } });
    return { list, count: Number(count), page, pageSize };
  }
}