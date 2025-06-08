import { requestFetch, RequestMethod } from "@/api/index";

interface CreateOrderApiParams {
  userAddress: string;
  marketId: number;
  orderId: string;
}

export const createOrderApi = ({
  userAddress,
  marketId,
  orderId,
}: CreateOrderApiParams) => {
  const url = "/api/v1/order/create";
  const requestOptions = {
    method: RequestMethod.POST,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
    body: {
      marketId,
      orderId,
    },
  };
  return requestFetch(url, requestOptions);
};

interface GetOrderListApiParams {
  page: number;
  orderSide: "buy" | "sell";
  marketId: number;
  priceSort: "asc" | "desc"; // asc 升序 或者 desc 降序
}

export const getOrderListApi = ({
  page,
  orderSide,
  marketId,
  priceSort,
}: GetOrderListApiParams) => {
  const url = `/api/v1/order/list?page=${page}&orderSide=${orderSide}&marketId=${marketId}&priceSort=${priceSort}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return requestFetch(url, requestOptions);
};

interface MatchOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
  hash: string;
}

export const matchOrderApi = ({
  userAddress,
  marketId,
  orderIds,
  hash,
}: MatchOrderApiParams) => {
  const url = "/api/v1/order/bid";
  const requestOptions = {
    method: RequestMethod.POST,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
    body: {
      marketId,
      orderIds,
      hash,
    },
  };
  return requestFetch(url, requestOptions);
};

interface CancelOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

export const cancelOrderApi = ({
  userAddress,
  marketId,
  orderIds,
}: CancelOrderApiParams) => {
  const url = "/api/v1/order/cancel";
  const requestOptions = {
    method: RequestMethod.POST,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
    body: {
      marketId,
      orderIds,
    },
  };
  return requestFetch(url, requestOptions);
};

interface RequestMyTradesApiParams {
  userAddress: string;
  orderSide: "buy" | "sell";
  page: number;
  marketId: number;
}

export const requestMyTradesApi = ({
  userAddress,
  orderSide,
  page,
  marketId,
}: RequestMyTradesApiParams) => {
  const url = `/api/v1/trade/list/my?page=${page}&orderSide=${orderSide}&marketId=${marketId}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
  };
  return requestFetch(url, requestOptions);
};

interface RequestMarketTradesParams {
  // userAddress: string;
  // orderSide: "buy" | "sell";
  marketId: number;
  page: number;
}

export const requestMarketTradesApi = ({
  // userAddress,
  // orderSide,
  marketId,
  page,
}: RequestMarketTradesParams) => {
  const url = `/api/v1/trade/list?page=${page}&marketId=${marketId}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
      // useraddress: userAddress,
    },
  };
  return requestFetch(url, requestOptions);
};

interface DepositTokenApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

export const depositTokenApi = ({
  userAddress,
  marketId,
  orderIds,
}: DepositTokenApiParams) => {
  const url = "/api/v1/order/deposit";
  const requestOptions = {
    method: RequestMethod.POST,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
    body: {
      marketId,
      orderIds,
    },
  };
  return requestFetch(url, requestOptions);
};

interface RefundOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

export const refundOrderApi = ({
  marketId,
  orderIds,
  userAddress,
}: RefundOrderApiParams) => {
  const url = "/api/v1/order/refound";
  const requestOptions = {
    method: RequestMethod.POST,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
    body: {
      marketId,
      orderIds,
    },
  };
  return requestFetch(url, requestOptions);
};

interface WithdrawOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

export const withdrawOrderApi = ({
  marketId,
  orderIds,
  userAddress,
}: WithdrawOrderApiParams) => {
  const url = "/api/v1/order/withdraw";
  const requestOptions = {
    method: RequestMethod.POST,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
    body: {
      marketId,
      orderIds,
    },
  };
  return requestFetch(url, requestOptions);
};

interface WithdrawBreachOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

export const withdrawBreachOrderApi = ({
  marketId,
  orderIds,
  userAddress,
}: WithdrawBreachOrderApiParams) => {
  const url = "/api/v1/order/withdraw/collateral";
  const requestOptions = {
    method: RequestMethod.POST,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
    body: {
      marketId,
      orderIds,
    },
  };
  return requestFetch(url, requestOptions);
};
