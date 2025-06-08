import { StaticImageData } from "next/image";

export type EnvMode = "development" | "production";

export const authTokenKey = "AuthToken";

export enum TxStatus {
  SUCCESS = 1,
  FAILED = 0,
}

export enum CreateStoryStep {
  TOKENINFO = "tokenInfo",
  AICHAT = "aiChat",
  EDITSTORY = "editStory",
  UPLOAD = "upload",
}

export enum ListDataStatus {
  INITIAL = "initial",
  SUCCESS = "success",
  LOADING = "loading",
  EMPTY = "empty",
}

export enum OrderType {
  BUY = "buy",
  SELL = "sell",
}

export enum ContractOrderType {
  BUY,
  SELL,
}

export const minOrderCollateral = 10; // 10 usdc

export interface TokenConfig {
  name: string;
  icon: StaticImageData;
}

export enum OrderStatus {
  Open = "open",
  Closed = "closed",
  Canceled = "canceled", // 取消
  Filled = "filled", // 成交
  Refund = "refund", // 退款
  Absenteeism = "absenteeism", // 违约
  Done = "done", // 已质押空投 token
  Claimable = "claimable", // 此状态仅存在于前端，表示已质押空投 token，且市场结束，交易双方可以获取各自收益
}

export enum OrderStatusX {
  Open = "open", // 开放状态，可进行购买
  Closed = "closed",
  Canceled = "canceled", // 取消
  Filled = "filled", // 成交
  Refund = "refund", // 退款
  Absenteeism = "absenteeism", // 违约
  Done = "done", // 双方到期履约
  Claimable = "claimable", // 可提款
}

export interface OrderStatusConfig {
  label: string;
  color: string;
}

export const OrderStatusMap: Record<OrderStatus, OrderStatusConfig> = {
  [OrderStatusX.Open]: {
    label: "Open",
    color: "#3b82f6", // Blue - indicates active/available
  },
  [OrderStatusX.Closed]: {
    label: "Closed",
    color: "#6b7280", // Gray - neutral/inactive state
  },
  [OrderStatusX.Canceled]: {
    label: "Canceled",
    color: "#ef4444", // Red - indicates termination/failure
  },
  [OrderStatusX.Filled]: {
    label: "Filled",
    color: "#10b981", // Green - success/completion
  },
  [OrderStatusX.Refund]: {
    label: "Refund",
    color: "#f59e0b", // Amber - indicates money movement/reversal
  },
  [OrderStatusX.Absenteeism]: {
    label: "Breach",
    color: "#dc2626", // Dark red - indicates violation
  },
  [OrderStatusX.Done]: {
    label: "Done",
    color: "#22c55e", // Bright green - positive completion
  },
  [OrderStatusX.Claimable]: {
    label: "Claimable",
    color: "#8b5cf6", // Violet - special state requiring action
  },
};

export interface PreMarketItem {
  icon: string;
  tokenName: string;
  symbol: string;
  marketId: number;
  key: string;
}

export const preMarketsMap: Record<string, PreMarketItem> = {
  WETH: {
    icon: '',
    tokenName: "WETH",
    symbol: "WETH",
    marketId: 0,
    key: "0",
  },
};
