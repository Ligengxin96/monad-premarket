import { addToast } from "@heroui/react";
import { useCallback } from "react";

enum RequestMethod {
  POST = "POST",
  GET = "GET",
}

interface RequestFetchOptions {
  method: RequestMethod;
  headers: HeadersInit;
  body?: Record<string, any>;
}

interface RequestMyOrdersApiParams {
  userAddress: string;
  orderSide: "buy" | "sell";
  page: number;
  marketId: number;
}

interface RequestPreMarketsParams {
  page: number;
}

interface RequestMyOrderMarketsParams {
  page: number;
  userAddress: string;
}

interface RequestMyTradeMarketsParams {
  page: number;
  userAddress: string;
}

interface RequestMarketInfoParams {
  marketId: number;
}

interface RequestMarketDetailsParams {
  marketId: number;
}

interface CreateOrderApiParams {
  userAddress: string;
  marketId: number;
  orderId: string;
}

interface GetOrderListApiParams {
  page: number;
  orderSide: "buy" | "sell";
  marketId: number;
  priceSort: "asc" | "desc"; // asc 升序 或者 desc 降序
}

interface MatchOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
  hash: string;
}

interface CancelOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

interface RequestMyTradesApiParams {
  userAddress: string;
  orderSide: "buy" | "sell";
  page: number;
  marketId: number;
}

interface RequestMarketTradesParams {
  marketId: number;
  page: number;
}

interface DepositTokenApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

interface RefundOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

interface WithdrawOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

interface WithdrawBreachOrderApiParams {
  userAddress: string;
  marketId: number;
  orderIds: string[];
}

export const useApiRequest = () => {

  const handleResponseStatus = useCallback((response: Response) => {
    switch (response.status) {
      case 403:
        addToast({
          title: "Authorization Expired",
          description:
            "Authorization is expired, please request for a new one.",
          color: "warning",
        });
        break;
      default:
        return;
    }
  }, []);

  const requestFetch = useCallback(
    (path: string, options: RequestFetchOptions) => {
      const { method, headers, body } = options;
      const requestOptions = {
        method,
        headers: {
          ...headers,
        },
        body: JSON.stringify(body),
      };
      console.log("api request requestOptions", requestOptions);
      const requestUrl = `http://43.198.115.10${path}`;

      return fetch(requestUrl, requestOptions)
        .then((response) => {
          handleResponseStatus(response);
          return response;
        })
        .catch((error) => {
          console.error("Fetch request failed.", error);
          throw error;
        });
    },
    [handleResponseStatus]
  );

  const requestMyOrdersApi = useCallback(
    ({ userAddress, orderSide, page, marketId }: RequestMyOrdersApiParams) => {
      const url = `/api/v1/order/my?page=${page}&orderSide=${orderSide}&marketId=${marketId}`;
      const requestOptions = {
        method: RequestMethod.GET,
        headers: {
          "Content-Type": "application/json",
          useraddress: userAddress,
        },
      };
      return requestFetch(url, requestOptions);
    },
    [requestFetch]
  );

  const requestPreMarkets = useCallback(
    ({ page }: RequestPreMarketsParams) => {
      const url = `/api/v1/token/list?page=${page}`;
      const requestOptions = {
        method: RequestMethod.GET,
        headers: {
          "Content-Type": "application/json",
        },
      };
      return requestFetch(url, requestOptions);
    },
    [requestFetch]
  );

  const requestMyOrderMarkets = useCallback(
    ({ page, userAddress }: RequestMyOrderMarketsParams) => {
      const url = `/api/v1/order/my/markets?page=${page}`;
      const requestOptions = {
        method: RequestMethod.GET,
        headers: {
          "Content-Type": "application/json",
          useraddress: userAddress,
        },
      };
      return requestFetch(url, requestOptions);
    },
    [requestFetch]
  );

  const requestMyTradeMarkets = useCallback(
    ({ page, userAddress }: RequestMyTradeMarketsParams) => {
      const url = `/api/v1/trade/my/markets?page=${page}`;
      const requestOptions = {
        method: RequestMethod.GET,
        headers: {
          "Content-Type": "application/json",
          useraddress: userAddress,
        },
      };
      return requestFetch(url, requestOptions);
    },
    [requestFetch]
  );

  const requestMarketInfo = useCallback(
    ({ marketId }: RequestMarketInfoParams) => {
      const url = `/api/v1/token/volume?marketId=${marketId}`;
      const requestOptions = {
        method: RequestMethod.GET,
        headers: {
          "Content-Type": "application/json",
        },
      };
      return requestFetch(url, requestOptions);
    },
    [requestFetch]
  );

  const requestMarketDetails = useCallback(
    ({ marketId }: RequestMarketDetailsParams) => {
      const url = `/api/v1/token/info?marketId=${marketId}`;
      const requestOptions = {
        method: RequestMethod.GET,
        headers: {
          "Content-Type": "application/json",
        },
      };
      return requestFetch(url, requestOptions);
    },
    [requestFetch]
  );

  const createOrderApi = useCallback(
    ({ userAddress, marketId, orderId }: CreateOrderApiParams) => {
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
    },
    [requestFetch]
  );

  const getOrderListApi = useCallback(
    ({ page, orderSide, marketId, priceSort }: GetOrderListApiParams) => {
      const url = `/api/v1/order/list?page=${page}&orderSide=${orderSide}&marketId=${marketId}&priceSort=${priceSort}`;
      const requestOptions = {
        method: RequestMethod.GET,
        headers: {
          "Content-Type": "application/json",
        },
      };
      return requestFetch(url, requestOptions);
    },
    [requestFetch]
  );

  const matchOrderApi = useCallback(
    ({ userAddress, marketId, orderIds, hash }: MatchOrderApiParams) => {
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
    },
    [requestFetch]
  );

  const cancelOrderApi = useCallback(
    ({ userAddress, marketId, orderIds }: CancelOrderApiParams) => {
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
    },
    [requestFetch]
  );

  const requestMyTradesApi = useCallback(
    ({ userAddress, orderSide, page, marketId }: RequestMyTradesApiParams) => {
      const url = `/api/v1/trade/list/my?page=${page}&orderSide=${orderSide}&marketId=${marketId}`;
      const requestOptions = {
        method: RequestMethod.GET,
        headers: {
          "Content-Type": "application/json",
          useraddress: userAddress,
        },
      };
      return requestFetch(url, requestOptions);
    },
    [requestFetch]
  );

  const requestMarketTradesApi = useCallback(
    ({
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
    },
    [requestFetch]
  );

  const depositTokenApi = useCallback(
    ({ userAddress, marketId, orderIds }: DepositTokenApiParams) => {
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
    },
    [requestFetch]
  );

  const refundOrderApi = useCallback(
    ({ marketId, orderIds, userAddress }: RefundOrderApiParams) => {
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
    },
    [requestFetch]
  );

  const withdrawOrderApi = useCallback(
    ({ marketId, orderIds, userAddress }: WithdrawOrderApiParams) => {
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
    },
    [requestFetch]
  );

  const withdrawBreachOrderApi = useCallback(
    ({ marketId, orderIds, userAddress }: WithdrawBreachOrderApiParams) => {
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
    },
    [requestFetch]
  );

  return {
    requestMyOrdersApi,
    requestPreMarkets,
    requestMyOrderMarkets,
    requestMyTradeMarkets,
    requestMarketInfo,
    requestMarketDetails,
    createOrderApi,
    getOrderListApi,
    matchOrderApi,
    cancelOrderApi,
    requestMyTradesApi,
    requestMarketTradesApi,
    depositTokenApi,
    refundOrderApi,
    withdrawOrderApi,
    withdrawBreachOrderApi,
  };
};
