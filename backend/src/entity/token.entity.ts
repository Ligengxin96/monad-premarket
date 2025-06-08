import { BaseEntity } from './base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'token' })
@Index(['marketId', 'marketAddress'], { unique: true })
export default class TokenEntity extends BaseEntity {
  @Column({ length: 16 })
  symbol: string;

  @Column({ type: 'int' })
  dicimal: number;

  @Index()
  @Column({ name: 'market_id' })
  marketId: number;

  @Index()
  @Column({ length: 64, name: 'market_address' })
  marketAddress: string;

  @Column({ length: 128 })
  icon: string;

  @Column({ name: 'start_time' })
  startTime: number;

  @Column({ name: 'end_time' })
  endTime: number;
}