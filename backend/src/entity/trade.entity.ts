import { OrderSide } from 'src/common/types';
import { BaseEntity } from './base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'trade' })
@Index(['marketId', 'orderId'], { unique: true })
export default class TradeEntity extends BaseEntity {
  @Index()
  @Column({ name: 'order_id', length: 32 })
  orderId: string;

  @Column({ length: 16, name: 'order_side' })
  orderSide: OrderSide;

  @Index()
  @Column({ length: 64 })
  asker: string;

  @Index()
  @Column({ length: 64 })
  bider: string;

  @Column({ length: 16 })
  symbol: string;

  @Column({ length: 36 })
  price: string;

  @Column({ length: 16 })
  amount: string;

  @Column({ length: 36, name: 'collateral_amount' })
  collateralAmount: string;

  @Column({ length: 16 })
  collateral: string;

  @Column({ name: 'collateral_address', length: 64 })
  collateralAddress: string;

  @Index()
  @Column({ name: 'market_id' })
  marketId: number;

  @Column()
  timestamp: number;

  @Index()
  @Column({ name: 'hash', length: 66 })
  hash: string;
}