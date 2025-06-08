import { requestFetch, RequestMethod } from "@/api/index";

interface RequestPreMarketsParams {
  page: number;
}

export const requestPreMarkets = ({ page }: RequestPreMarketsParams) => {
  const url = `/api/v1/token/list?page=${page}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return requestFetch(url, requestOptions);
};

interface RequestMyOrderMarketsParams {
  page: number;
  userAddress: string;
}

export const requestMyOrderMarkets = ({
  page,
  userAddress,
}: RequestMyOrderMarketsParams) => {
  const url = `/api/v1/order/my/markets?page=${page}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
  };
  return requestFetch(url, requestOptions);
};

interface RequestMyTradeMarketsParams {
  page: number;
  userAddress: string;
}

export const requestMyTradeMarkets = ({
  page,
  userAddress,
}: RequestMyTradeMarketsParams) => {
  const url = `/api/v1/trade/my/markets?page=${page}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
  };
  return requestFetch(url, requestOptions);
};

interface RequestMarketInfoParams {
  marketId: number;
}

export const requestMarketInfo = ({ marketId }: RequestMarketInfoParams) => {
  const url = `/api/v1/token/volume?marketId=${marketId}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return requestFetch(url, requestOptions);
};

interface RequestMarketDetailsParams {
  marketId: number;
}

export const requestMarketDetails = ({
  marketId,
}: RequestMarketDetailsParams) => {
  const url = `/api/v1/token/info?marketId=${marketId}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
    },
  };
  return requestFetch(url, requestOptions);
};
