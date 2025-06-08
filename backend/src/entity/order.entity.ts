import { OrderStatus, OrderSide, OrderType } from 'src/common/types';
import { BaseEntity } from './base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'orders' })
@Index(['marketId', 'orderId'], { unique: true })
export default class OrdersEntity extends BaseEntity {
  @Index()
  @Column({ name: 'order_id', length: 32 })
  orderId: string;

  @Index()
  @Column({ length: 16, name: 'order_side' })
  orderSide: OrderSide;

  @Index()
  @Column({ length: 16, default: OrderType.Full, name: 'order_type' })
  orderType: OrderType;

  @Index()
  @Column({ length: 16 })
  symbol: string;

  @Index()
  @Column({ length: 36 })
  price: string;

  @Column({ length: 16 })
  amount: string;

  @Column({ length: 16, name: 'order_status' })
  orderStatus: OrderStatus;

  @Index()
  @Column({ name: 'user_address', length: 64 })
  userAddress: string;

  @Column({ length: 16 })
  collateral: string;

  @Index()
  @Column({ name: 'market_id' })
  marketId: number;

  @Column({ name: 'collateral_address', length: 64 })
  collateralAddress: string;

  @Column({ name: 'is_ask_withdraw', default: false })
  isAskWithdrawed: boolean;

  @Column({ name: 'is_bid_withdraw', default: false })
  isBidWithdrawed: boolean;
}