"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Alert,
} from "@heroui/react";
import { MaxUint256 } from "ethers";
import type { Selection } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { BigNumber } from "bignumber.js";
import Image, { StaticImageData } from "next/image";
import { TransactionHistoryComponent } from "./components/txHistory";

// assets

import { ListDataStatus, preMarketsMap, TxStatus } from "@/utils/constant";
import { formatUnits, parseUnits } from "ethers";
import { useCurrentChainContracts } from "@/hooks/useCurrentContracts";
import { useAccount } from "wagmi";
import { Erc20Abi__factory } from "@/types/contracts/erc20/factories/Erc20Abi__factory";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { SimpleCore__factory } from "@/types/contracts/simple-core";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { useCurrentChainConfig } from "@/hooks/useCurrentChain";
import { getHashShortcut } from "@/utils";
import dayjs from "dayjs";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useTokenInfo } from "@/providers/tokenInfoProvider";
import { SimpleFactory__factory } from "@/types/contracts/simple-factory";

interface Order {
  id: number;
  orderId: string;
  orderSide: string;
  orderType: string;
  symbol: string;
  price: string;
  amount: string;
  orderStatus: string;
  userAddress: string;
  collateral: string;
  collateralAmount: string;
  collateralAddress: string;
  isCreatedByUser?: boolean;
  icon: StaticImageData | string;
}

interface SocialLink {
  name: string;
  link: string;
  icon: any;
}

interface marketInfoInterface {
  id: string;
  tokenName: string;
  tokenIcon: string | StaticImageData;
  price: string;
  vol24h: string;
  totalVol: string;
  startTime: string;
  endTime: string;
  isMarketEnd: boolean;
  links: SocialLink[];
}

const tempInfo = {
  id: "-",
  tokenName: "",
  tokenIcon: "",
  price: "-",
  vol24h: "-",
  totalVol: "-",
  startTime: "-",
  endTime: "-",
  isMarketEnd: false,
  links: [
    {
      name: "twitter",
      link: "",
      icon: '',
    },
    {
      name: "homepage",
      link: "",
      icon: '',
    },
  ],
};

interface BatchTradeInfo {
  price: string;
  amount: string;
  collateralAmount: string;
}

export default function MarketDetails() {
  const { address } = useAccount();
  const signer = useEthersSigner();
  const params = useParams();
  const searchParams = useSearchParams();
  const { usdc } = useTokenInfo();
  const {
    getOrderListApi,
    matchOrderApi,
    requestMarketInfo,
    requestPreMarkets,
  } = useApiRequest();
  const marketAddressParams = searchParams.get("marketAddress");
  const { currentChainContracts } = useCurrentChainContracts();
  const { currentChainConfig } = useCurrentChainConfig();
  const [marketInfo, setMarketInfo] = useState<marketInfoInterface>(tempInfo);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order>();
  const [selectedBuyOrder, setSelectedBuyOrder] = useState<Selection>(
    new Set()
  );
  const [selectedSellOrder, setSelectedSellOrder] = useState<Selection>(
    new Set()
  );
  const [isBatchBuyOrders, setIsBatchBuyOrders] = useState(false);
  const [isBatchSellOrders, setIsBatchSellOrders] = useState(false);
  const [usdcBalance, setUSDCBalance] = useState("0");
  const [batchBuyOrders, setBatchBuyOrders] = useState<Selection>(new Set([]));
  const [buyOrderListDataStatus, setBuyOrderListDataStatus] =
    useState<ListDataStatus>(ListDataStatus.LOADING);
  const [sellOrderListDataStatus, setSellOrderListDataStatus] =
    useState<ListDataStatus>(ListDataStatus.LOADING);
  const [batchTradeInfo, setBatchTradeInfo] = useState<BatchTradeInfo>();
  const [marketAddress, setMarketAddress] = useState("");
  const [isTradeButtonLoading, setIsTradeButtonLoading] = useState(false);

  const getUSDCBalance = useCallback(async () => {
    if (currentChainContracts && address && signer && usdc) {
      const usdcContract = Erc20Abi__factory.connect(
        currentChainContracts.usdc.address,
        signer
      );
      const usdcBalance = await usdcContract.balanceOf(address);
      console.log("usdcBalance", usdcBalance);
      const usdcReadValue = formatUnits(usdcBalance, usdc.decimals);
      setUSDCBalance(Number(usdcReadValue).toFixed(2));
    }
  }, [address, currentChainContracts, signer, usdc]);

  const updateMarketInfo = useCallback(async () => {
    const marketId = params.id as string;
    const marketInfoResponse = await requestMarketInfo({
      marketId: Number(marketId),
    });
    if (marketInfoResponse.ok) {
      const marketInfoData = await marketInfoResponse.json();
      console.log("marketInfoData", marketInfoData);
      const newMarketInfo = {
        ...marketInfo,
        price: marketInfoData.lastPrice,
        vol24h: marketInfoData.h24Volume,
        totalVol: marketInfoData.totalVolume,
      };
      setMarketInfo(newMarketInfo);
    }
  }, [marketInfo, params.id, requestMarketInfo]);

  const initMarketInfo = useCallback(async () => {
    const currentMarketId = params.id as string;
    // get market address
    if (currentChainContracts) {
      const simpleFactoryContract = SimpleFactory__factory.connect(
        currentChainContracts.simpleFactory.address,
        signer
      );
      simpleFactoryContract
        .getMarketInfo(currentMarketId)
        .then((marketInfo) => {
          console.log("marketInfo address", marketInfo.market);
          setMarketAddress(marketInfo.market);
        });
    }
    // TODO: add api to get market info
    const response = await requestPreMarkets({ page: 1 });
    console.log("pre-markets list", response);
    if (response.ok) {
      const listData = await response.json();
      console.log("listData", listData);
      const currentMarket = listData.data.list.find((market: any) => {
        return market.marketId === Number(currentMarketId);
      });
      const startTimeStamp = Number(currentMarket.startTime) * 1000;
      const endTimeStamp = Number(currentMarket.endTime) * 1000;
      const currentTimeStamp = new Date().getTime();
      const marketConfig = preMarketsMap[currentMarket.symbol];
      if (currentMarket) {
        const currentMarketInfo = {
          id: currentMarket.id,
          tokenName: currentMarket.symbol,
          tokenIcon: marketConfig ? marketConfig.icon : "",
          chainIcon: '',
          price: currentMarket.lastPrice,
          vol24h: currentMarket.h24Volume,
          totalVol: currentMarket.totalVolume,
          startTime: dayjs(Number(currentMarket.startTime) * 1000).format(
            "YYYY-MM-DD HH:mm"
          ),
          endTime: currentMarket.endTime
            ? dayjs(Number(currentMarket.endTime) * 1000).format(
                "YYYY-MM-DD HH:mm"
              )
            : "-",
          isMarketEnd: currentTimeStamp > endTimeStamp,
          links: [
            {
              name: "twitter",
              link: "",
              icon: '',
            },
            {
              name: "homepage",
              link: "",
              icon: '',
            },
          ],
        };
        setMarketInfo(currentMarketInfo);
      }
    }
  }, [currentChainContracts, params.id, requestPreMarkets, signer]);

  const handleSelectOrder = async (order: Order) => {
    if (marketAddress) {
      const simpleCoreContract = SimpleCore__factory.connect(
        marketAddress,
        signer
      );
      const formatOrderId = BigInt(order.orderId);
      const selectedOrderInfo = await simpleCoreContract.getOrderInfo(
        formatOrderId
      );
      if (selectedOrderInfo.creator === address) {
        order.isCreatedByUser = true;
      }
      const marketConfig = preMarketsMap[order.symbol];
      order.icon = marketConfig.icon;
      setSelectedOrder(order);
    }
  };

  const approve = useCallback(
    async (
      ERC20Contract: any,
      spender: string,
      amount: bigint,
      owner: string
    ) => {
      if (currentChainContracts && owner) {
        try {
          const allowance = await ERC20Contract.allowance(owner, spender);
          console.log("market allowance", allowance);
          if (allowance < amount) {
            const approve = await ERC20Contract.approve(spender, MaxUint256, {
              gasLimit: 200000,
            });
            await approve.wait();
          }
          return true;
        } catch (e) {
          toast.error("Approve failed.", {
            position: "top-center",
          });
          console.error("Approve erorr:", e);
          return false;
        }
      }
    },
    [currentChainContracts]
  );

  const renderToastContent = useCallback(
    (txHash: string, content: string) => {
      let explorerSuffix = "";
      if (currentChainConfig && currentChainConfig.blockExplorers) {
        explorerSuffix = currentChainConfig.blockExplorers.default.url;
      }
      const txHashUrl = `${explorerSuffix}/tx/${txHash}`;
      const shortHash = getHashShortcut(txHash, 6, 4);
      return (
        <div className="flex flex-col text-sm">
          <div>{content}</div>
          <div className="flex">
            <span className="flex mr-2">Transaction:</span>
            <a
              className="flex items-center text-gray-500"
              href={txHashUrl}
              target="_blank"
            >
              <div className="flex">{shortHash}</div>
            </a>
          </div>
        </div>
      );
    },
    [currentChainConfig]
  );

  const getBuyOrderList = useCallback(async () => {
    const marketId = params.id as string;
    getOrderListApi({
      page: 1,
      orderSide: "buy",
      marketId: Number(marketId),
      priceSort: "desc",
    })
      .then((response) => {
        console.log("buy orders response", response);
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        console.log("buy orders data", data);
        const list = data.data.list.map((order: any) => {
          const collateralAmount = BigNumber(order.amount)
            .multipliedBy(order.price)
            .toFixed();
          console.log("buy collateralAmount", collateralAmount);
          return {
            ...order,
            collateralAmount,
          };
        });
        setBuyOrders(list);
        setBuyOrderListDataStatus(ListDataStatus.SUCCESS);
      });
  }, [getOrderListApi, params.id]);

  const getSellOrderList = useCallback(async () => {
    const marketId = params.id as string;
    getOrderListApi({
      page: 1,
      orderSide: "sell",
      marketId: Number(marketId),
      priceSort: "asc",
    })
      .then((response) => {
        console.log("sell orders response", response);
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        console.log("sell orders data", data);
        const list = data.data.list.map((order: any) => {
          const collateralAmount = BigNumber(order.amount)
            .multipliedBy(order.price)
            .toFixed();
          console.log("sell collateralAmount", collateralAmount);
          return {
            ...order,
            collateralAmount,
          };
        });
        setSellOrders(list);
        setSellOrderListDataStatus(ListDataStatus.SUCCESS);
      });
  }, [getOrderListApi, params.id]);

  const singleOrderMatchTrade = useCallback(async () => {
    try {
      if (
        currentChainContracts &&
        selectedOrder &&
        address &&
        marketAddressParams &&
        usdc
      ) {
        console.log("match trade");
        console.log("market address", marketAddressParams);
        setIsTradeButtonLoading(true);
        const marketId = params.id as string;
        const simpleCoreContract = SimpleCore__factory.connect(
          marketAddressParams,
          signer
        );
        const usdcContract = Erc20Abi__factory.connect(
          currentChainContracts.usdc.address,
          signer
        );
        const spendUSDCAmount = parseUnits(
          selectedOrder.collateralAmount,
          usdc.decimals
        );
        const tradeType = selectedOrder.orderSide === "buy" ? 1n : 0n;
        console.log("selectedOrder.amount", selectedOrder.amount);
        const tradeAmount = parseUnits(selectedOrder.amount, 6);
        const tradePrice = parseUnits(selectedOrder.price, 6);
        const tradeIds = BigInt(selectedOrder.orderId);
        const isApproveSuccessful = await approve(
          usdcContract,
          marketAddressParams,
          spendUSDCAmount,
          address
        );
        if (!isApproveSuccessful) {
          console.log("approve failed");
          setIsTradeButtonLoading(false);
          return;
        }

        console.log("tradeType", tradeType);
        console.log("tradeAmount", tradeAmount);
        console.log("tradePrice", tradePrice);
        console.log("tradePrice read", formatUnits(tradePrice, 18));
        console.log("tradeIds", tradeIds);
        const matchTradeResult = await simpleCoreContract.matchOrder(
          tradeType,
          tradeIds,
          { gasLimit: 600000 } // 批量订单 gasList = 500000 * 订单数
        );
        console.log("matchTradeResult", matchTradeResult);
        const matchTradeTx = await matchTradeResult.wait();
        console.log("matchTradeTx", matchTradeTx);
        if (matchTradeTx && matchTradeTx.status === TxStatus.SUCCESS) {
          const response = await matchOrderApi({
            userAddress: address,
            marketId: Number(marketId),
            orderIds: [selectedOrder.orderId],
            hash: matchTradeTx.hash,
          });
          if (response.ok) {
            const data = await response.json();
            console.log("match order api data", data);
            toast.success(
              renderToastContent(
                matchTradeTx.hash,
                "Match order successfully!"
              ),
              {
                position: "top-right",
              }
            );
            updateMarketInfo();
            setIsTradeButtonLoading(false);
            if (selectedOrder.orderSide === "buy") {
              getBuyOrderList();
            } else {
              getSellOrderList();
            }
          }
        } else {
          // create order failed
          toast.error("Match order failed.");
        }
      }
    } catch (error) {
      setIsTradeButtonLoading(false);
      toast.error("Match order failed.");
      throw error;
    }
  }, [
    address,
    approve,
    currentChainContracts,
    getBuyOrderList,
    getSellOrderList,
    marketAddressParams,
    matchOrderApi,
    params.id,
    renderToastContent,
    selectedOrder,
    signer,
    updateMarketInfo,
    usdc,
  ]);

  const handleSelectBuyOrder = (keys: Selection) => {
    setSelectedSellOrder(new Set());
    setSelectedBuyOrder(keys);
  };

  const handleSelectSellOrder = (keys: Selection) => {
    setSelectedBuyOrder(new Set());
    setSelectedSellOrder(keys);
  };

  const matchTrade = useCallback(async () => {
    console.log("match trade");
    console.log("marketAddressParams", marketAddressParams);
    // split single trade and batch trade
    if (selectedOrder) {
      // single order
      console.log("single order trade");
      singleOrderMatchTrade();
    } else {
      // batch order
      console.log("batch order trade");
      // batchOrderMatchTrade();
    }
  }, [
    // batchOrderMatchTrade,
    marketAddressParams,
    selectedOrder,
    singleOrderMatchTrade,
  ]);

  const renderTradeButton = useCallback(
    (marketInfo: any) => {
      const batchBuyOrdersArray = Array.from(batchBuyOrders);
      console.log("selectedOrder?.orderSide", selectedOrder?.orderSide);
      console.log("batchBuyOrdersArray.length", batchBuyOrdersArray.length);
      return (
        <Button
          color="secondary"
          onPress={matchTrade}
          isDisabled={
            marketInfo.isMarketEnd ||
            (selectedOrder && selectedOrder.isCreatedByUser) ||
            isTradeButtonLoading
          }
          className="relative h-[50px] my-4 text-white/80 text-base font-medium"
        >
          {selectedOrder?.orderSide === "buy" ? "Sell" : "Buy"}{" "}
          {marketInfo.tokenName}
          {isTradeButtonLoading && (
            <Spinner
              size="sm"
              className="absolute top-[50%] right-[115px] translate-y-[-50%]"
              color="default"
            />
          )}
        </Button>
      );
    },
    [batchBuyOrders, isTradeButtonLoading, matchTrade, selectedOrder]
  );

  const init = useCallback(() => {
    getBuyOrderList();
    getSellOrderList();
    getUSDCBalance();
    initMarketInfo();
  }, [getBuyOrderList, getUSDCBalance, getSellOrderList, initMarketInfo]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="h-full w-full text-white pt-10 px-16 overflow-y-scroll">
      <div className="max-w-[1200px] mx-auto flex flex-col">
        <Card>
          <CardBody>
            <div className="flex justify-between text-white/80">
              <div className="flex items-center gap-[20px]">
                <div className="relative flex h-[36px] w-[36px]">
                  <div className="h-full w-full rounded-full bg-gray-500">
                    {marketInfo.tokenIcon && (
                      <Image
                        className="h-full w-full rounded-full"
                        src={marketInfo.tokenIcon}
                        alt="token"
                      ></Image>
                    )}
                  </div>
                </div>
                <div>{marketInfo.tokenName}</div>
                <div>$ {marketInfo.price}</div>
                <div className="flex flex-col text-xs">
                  <span className="text-gray-500">24h Vol</span>
                  <span>{marketInfo.vol24h} USDC</span>
                </div>
                <div className="flex flex-col text-xs">
                  <span className="text-gray-500">Total Vol</span>
                  <span>{marketInfo.totalVol} USDC</span>
                </div>
                <div className="flex flex-col text-xs">
                  <span className="text-gray-500">Start Time</span>
                  <span>{marketInfo.startTime}</span>
                </div>
                <div className="flex flex-col text-xs">
                  <span className="text-gray-500">End Time</span>
                  <span>{marketInfo.endTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {marketInfo.links.map((link) => {
                  return (
                    <a
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10"
                      key={link.name}
                      href={link.link}
                    >
                      <link.icon
                        className="fill-gray-500"
                        height={12}
                        width={12}
                      ></link.icon>
                    </a>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>
        <div className="flex gap-6 mt-6">
          <Card className="flex-1">
            <CardHeader className="text-white text-xl">Orders</CardHeader>
            <CardBody>
              <div className="min-h-[510px] flex gap-8">
                {/* buy orders */}
                <div className="flex-1">
                  <Table
                    className="flex-1"
                    aria-label="Example static collection table"
                    selectionMode={isBatchBuyOrders ? "multiple" : "single"}
                    removeWrapper
                    color="secondary"
                    selectedKeys={selectedBuyOrder}
                    onSelectionChange={(keys: Selection) =>
                      handleSelectBuyOrder(keys)
                    }
                  >
                    <TableHeader>
                      <TableColumn>Price</TableColumn>
                      <TableColumn>Amount</TableColumn>
                      <TableColumn>Collateral</TableColumn>
                      <TableColumn>
                        {""}
                        {/* <Button
                        onPress={buyOrdersBatchSwitch}
                        className="w-full"
                        size="sm"
                      >
                        Batch Orders
                      </Button> */}
                      </TableColumn>
                    </TableHeader>
                    <TableBody
                      isLoading={
                        buyOrderListDataStatus === ListDataStatus.LOADING
                      }
                      loadingContent={<Spinner color="secondary" label="" />}
                      emptyContent={"No buy orders for now."}
                    >
                      {sellOrders.map((order) => {
                        return (
                          <TableRow
                            className="text-white/80"
                            key={order.orderId}
                            onClick={() => handleSelectOrder(order)}
                          >
                            <TableCell>
                              <span className="text-green-500">
                                {order.price}
                              </span>
                            </TableCell>
                            <TableCell>{order.amount}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-[4px]">
                                {order.collateralAmount}
                       
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center justify-center py-1 px-2 border border-white/30 rounded-lg">
                                Buy
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {/* sell orders */}
                <div className="flex-1">
                  <Table
                    aria-label="Example static collection table"
                    selectionMode={isBatchSellOrders ? "multiple" : "single"}
                    removeWrapper
                    color="secondary"
                    selectedKeys={selectedSellOrder}
                    onSelectionChange={(keys: Selection) =>
                      handleSelectSellOrder(keys)
                    }
                  >
                    <TableHeader>
                      <TableColumn>Price</TableColumn>
                      <TableColumn>Amount</TableColumn>
                      <TableColumn>Collateral</TableColumn>
                      <TableColumn>
                        {""}
                        {/* <Button
                        onPress={sellOrdersBatchSwitch}
                        className="w-full"
                        size="sm"
                      >
                        Batch Orders
                      </Button> */}
                      </TableColumn>
                    </TableHeader>
                    <TableBody
                      isLoading={
                        sellOrderListDataStatus === ListDataStatus.LOADING
                      }
                      loadingContent={<Spinner color="secondary" label="" />}
                      emptyContent={"No sell orders for now."}
                    >
                      {buyOrders.map((order) => {
                        return (
                          <TableRow
                            className="text-white"
                            key={order.orderId}
                            onClick={() => handleSelectOrder(order)}
                          >
                            <TableCell>
                              <span className="text-red-500">
                                {order.price}
                              </span>
                            </TableCell>
                            <TableCell>{order.amount}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-[4px]">
                                {order.collateralAmount}
                               
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center justify-center py-1 px-2 border border-white/30 rounded-lg">
                                Sell
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardBody>
          </Card>
          {
            <Card className="w-[384px]">
              <CardHeader className="w-full flex flex-col items-start">
                <div className="text-xl font-medium text-white">
                  {marketInfo.tokenName}/USDC
                </div>
                <div className="text-base text-white/30">
                  {selectedOrder ? selectedOrder.price : "-"}
                </div>
              </CardHeader>
              <CardBody className="text-white/30">
                <div className="flex justify-center items-center text-sm rounded-lg">
                  {selectedOrder ? (
                    <div className="relative w-full flex flex-col">
                      <div className="flex flex-col w-ful bg-[#242425] rounded-lg p-4 mb-1">
                        <div className="mb-2 text-xs">
                          {selectedOrder.orderSide === "buy"
                            ? "SELLING"
                            : "BUYING"}
                        </div>
                        <div className="h-[40px] flex items-center justify-between">
                          <span className="text-xl font-medium">
                            {selectedOrder.amount}
                          </span>
                          <div className="h-[20px] w-[20px] rounded-full bg-gray-500">
                            {selectedOrder.icon && (
                              <Image
                                className="h-[20px] w-[20px] rounded-full"
                                width={20}
                                height={20}
                                src={selectedOrder.icon}
                                alt="token"
                              ></Image>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col w-ful bg-[#242425] rounded-lg p-4">
                        <div className="flex justify-between mb-2 text-xs">
                          <span>COLLATERAL</span>
                          <div className="flex gap-1">
                            Balance:{" "}
                            <span className="text-white">
                              {usdcBalance} USDC
                            </span>
                          </div>
                        </div>
                        <div className="h-[40px] flex items-center justify-between">
                          <span className="text-xl font-medium">
                            {selectedOrder.collateralAmount}
                          </span>
                       
                        </div>
                      </div>
                      <div className="absolute z-10 left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] rounded-full bg-[#242425] p-1 border-2 border-[rgb(24,24,27)]">
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-white/10 rounded-lg h-[160px] w-full">
                      <p>Please select the offer to start trading</p>
                    </div>
                  )}
                </div>
                {renderTradeButton(marketInfo)}
                {/* <div className="flex text-xs mb-2">
                  <SvgIconInfo
                    className="mr-1"
                    height={14}
                    width={14}
                  ></SvgIconInfo>
                  This market is end at {marketInfo.endTime}.
                </div> */}
                {marketInfo.isMarketEnd && (
                  <div className="mb-3">
                    <Alert
                      variant="faded"
                      color="secondary"
                      description={`This market is end at ${marketInfo.endTime}.`}
                    />
                  </div>
                )}
                {!marketInfo.isMarketEnd &&
                  selectedOrder &&
                  selectedOrder.isCreatedByUser && (
                    <div className="mb-3">
                      <Alert
                        variant="faded"
                        color="warning"
                        description="This order was created by you and cannot be matched."
                      />
                    </div>
                  )}
                {!marketInfo.isMarketEnd && (
                  <>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Trading</span>
                      <span>
                        {selectedOrder ? selectedOrder.amount : "-"}{" "}
                        {marketInfo.tokenName}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Collateral</span>
                      <span>
                        {selectedOrder ? selectedOrder.collateralAmount : "-"}{" "}
                      </span>
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          }
          {(isBatchBuyOrders || isBatchSellOrders) && (
            <Card className="w-[384px]">
              <CardHeader className="w-full flex flex-col items-start">
                <div className="text-xl font-medium text-white">
                  {marketInfo.tokenName}/USDC
                </div>
                <div className="text-base text-white/30">
                  {batchTradeInfo ? batchTradeInfo.price : "-"}
                </div>
              </CardHeader>
            </Card>
          )}
        </div>
        <Card className="mt-6 mb-20">
          <CardHeader className="w-full text-white">Trade History</CardHeader>
          <CardBody>
            <TransactionHistoryComponent></TransactionHistoryComponent>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
