import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'collateral' })
export default class CollateralEntity extends BaseEntity {
  @Column({ length: 16 })
  symbol: string;

  @Column({ type: 'int' })
  dicimal: number;

  @Index({ unique: true })
  @Column({ length: 64 })
  address: string;

  @Column({ length: 128 })
  icon: string;
}