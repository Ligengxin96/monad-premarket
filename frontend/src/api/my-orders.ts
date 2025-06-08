import { requestFetch, RequestMethod } from "@/api/index";

interface RequestMyOrdersApiParams {
  userAddress: string;
  orderSide: "buy" | "sell";
  page: number;
  marketId: number;
}

export const requestMyOrdersApi = ({
  userAddress,
  orderSide,
  page,
  marketId,
}: RequestMyOrdersApiParams) => {
  const url = `/api/v1/order/my?page=${page}&orderSide=${orderSide}&marketId=${marketId}`;
  const requestOptions = {
    method: RequestMethod.GET,
    headers: {
      "Content-Type": "application/json",
      useraddress: userAddress,
    },
  };
  return requestFetch(url, requestOptions);
};
