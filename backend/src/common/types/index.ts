export enum OrderSide {
  Buy = 'buy',
  Sell = 'sell',
}

export enum OrderStatus {
  Open = 'open',
  Closed = 'closed',
  Canceled = 'canceled',
  Filled = 'filled',
  Refund = 'refund',
  Absenteeism = 'absenteeism',
  Done = 'done',
}

export enum OrderType {
  Full = 'full',
  Partial = 'partial',
}

export enum PriceSort {
  Asc = 'asc',
  Desc = 'desc',
}

export enum EventName {
  CreateOrder = 'CreateOrder',
  MatchOrders = 'MatchOrders',
}

export interface MarketInfo {
  marketAddress: string,
  createTime: number,
}

export interface MarketConfig {
  tokenAddress: string,
  collateralAddress: string,
  endTime: number,
}

export interface OrderInfo {
  orderId: string,
  orderType: OrderSide,
  state: OrderStatus,
  creatorWithdrawed: boolean,
  traderWithdrawed: boolean,
  trader: string,
  creator: string,
  amount: string,
  doneAmount: string,
  price: string,
  creationTime: string,
}

export interface ContractAddressConfigType {
  USDC: string,
  Governance: string,
  SimpleFactory: string,
  SimpleMarketCore: string,
  Helper: string,
}