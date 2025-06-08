"use client";
import React, { useCallback, useEffect, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Spinner } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import { toast } from "react-toastify";
import {
  ListDataStatus,
  OrderStatus,
  TxStatus,
  OrderStatusMap,
  OrderStatusConfig,
  preMarketsMap,
} from "@/utils/constant";
import { useParams } from "next/navigation";
import { getHashShortcut } from "@/utils";
import { useAccount } from "wagmi";
import { useCurrentChainConfig } from "@/hooks/useCurrentChain";
import clsx from "clsx";

// assets
import { useCurrentChainContracts } from "@/hooks/useCurrentContracts";
import { SimpleFactory__factory } from "@/types/contracts/simple-factory";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { SimpleCore__factory } from "@/types/contracts/simple-core";
import { Erc20Abi__factory } from "@/types/contracts/erc20/factories/Erc20Abi__factory";
import { formatUnits, MaxUint256, parseUnits } from "ethers";
import { SimpleHelper__factory } from "@/types/contracts/simple-helper";
import styles from "./tradesTable.module.css";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useTokenInfo } from "@/providers/tokenInfoProvider";

interface ListItem {
  amount: string;
  collateral: string; // USDT
  collateralAmount: string;
  collateralAddress: string;
  id: number;
  isAskWithdrawed: boolean; // 卖单：提取自己的抵押物和买家的抵押物  买单：提取卖家质押的空投token
  isBidWithdrawed: boolean; // 吃买单：提取自己的抵押物和买家的抵押物  吃卖单：提取卖家质押的空投token
  marketId: string;
  orderId: string;
  orderSide: string; // buy or sell
  orderStatus: OrderStatus;
  orderStatusConfig: OrderStatusConfig;
  orderType: string; // full or partial
  price: string; // bigint string 300000000000000000
  symbol: string;
  userAddress: string;
  icon: StaticImageData | string;
}

const itemsPerPage = 10;

interface MyTradesListComponentProps {
  orderType: "buy" | "sell";
}

interface ModalInfo {
  status: OrderStatusConfig;
  fee: number;
  collateralAmount: number;
  airdropAmount: number;
  depositAirdropAmount: number;
}

enum ModalType {
  CANCEL,
  WITHDRAW,
  DEPOSIT,
}

type ActionCallback = () => void;

export const MyTradesListComponent = ({
  orderType,
}: MyTradesListComponentProps) => {
  const signer = useEthersSigner();
  const { currentChainConfig } = useCurrentChainConfig();
  const { currentChainContracts } = useCurrentChainContracts();
  const { usdc } = useTokenInfo();
  const params = useParams();
  const { address } = useAccount();
  const {
    depositTokenApi,
    requestMyTradesApi,
    withdrawBreachOrderApi,
    withdrawOrderApi,
    requestMarketDetails,
  } = useApiRequest();
  const [listDataStatus, setListDataStatus] = useState<ListDataStatus>(
    ListDataStatus.INITIAL
  );
  const [listData, setListData] = useState<ListItem[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listAllPages, setListAllPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState<ModalInfo>();
  const [modalInfoStatus, setModalInfoStatus] = useState<ListDataStatus>(
    ListDataStatus.LOADING
  );
  const [actionCallback, setActionCallback] = useState<ActionCallback | null>(
    null
  );
  const [isModalActionLoading, setIsModalActionLoading] = useState(false);
  const [modalType, setModalType] = useState<ModalType>();

  const getMarketEndStatus = useCallback(async () => {
    const marketId = params.id as string;
    const currentTime = new Date().getTime();
    const marketDetails = await requestMarketDetails({
      marketId: Number(marketId),
    });
    if (marketDetails.ok) {
      const marketDetailsData = await marketDetails.json();
      const endTime = Number(marketDetailsData.data.marketInfo.endTime) * 1000;
      const isMarketEnd = currentTime > endTime;
      return isMarketEnd;
    }
    return false;
  }, [params.id, requestMarketDetails]);

  const requestListData = useCallback(
    async (page: number) => {
      const marketId = params.id as string;
      console.log("request list data, page:", page);
      try {
        setListDataStatus(ListDataStatus.LOADING);
        if (address) {
          const currentMarketEndStatus = await getMarketEndStatus();
          requestMyTradesApi({
            userAddress: address,
            page,
            orderSide: orderType,
            marketId: Number(marketId),
          })
            .then((response) => {
              console.log("response", response);
              if (response.ok) {
                return response.json();
              }
            })
            .then((data) => {
              console.log(orderType, "trades data", data);
              const allPages = Math.ceil(data.data.count / itemsPerPage);
              const list = data.data.list.map((order: ListItem) => {
                const showPrice = order.price;
                const tempRaiseTimes = 18;
                const calPrice = parseUnits(order.price, tempRaiseTimes);
                const calAmount = parseUnits(order.amount, tempRaiseTimes);
                const collateralAmount = formatUnits(
                  calPrice * calAmount,
                  tempRaiseTimes * 2
                );
                let orderStatus = order.orderStatus;
                // 如果市场结束后，订单是 open 状态则显示退款
                if (
                  order.orderStatus === OrderStatus.Open &&
                  currentMarketEndStatus
                ) {
                  orderStatus = OrderStatus.Refund;
                }
                // 如果市场结束后，订单是 filled 状态则显示违约
                if (
                  order.orderStatus === OrderStatus.Filled &&
                  currentMarketEndStatus
                ) {
                  orderStatus = OrderStatus.Absenteeism;
                }
                // 如果市场结束后，订单是 done 状态则表示正常交易，双方可获取各自收益
                if (
                  order.orderStatus === OrderStatus.Done &&
                  currentMarketEndStatus
                ) {
                  orderStatus = OrderStatus.Claimable;
                }
                const orderStatusConfig = OrderStatusMap[orderStatus];
                const marketConfig = preMarketsMap[order.symbol];
                return {
                  ...order,
                  price: showPrice,
                  orderStatus,
                  collateralAmount,
                  orderStatusConfig,
                  icon: marketConfig ? marketConfig.icon : "",
                };
              });
              setListAllPages(allPages);
              console.log("before set list,", orderType, list);
              setListData(list);
              setListDataStatus(ListDataStatus.SUCCESS);
            });
        }
      } catch (error) {
        console.error("fetch list data failed", error);
        setListDataStatus(ListDataStatus.EMPTY);
      }
    },
    [address, getMarketEndStatus, orderType, params.id, requestMyTradesApi]
  );

  const renderToastContent = (txHash: string, toastContent: string) => {
    let explorerSuffix = "";
    if (currentChainConfig && currentChainConfig.blockExplorers) {
      explorerSuffix = currentChainConfig.blockExplorers.default.url;
    }
    const txHashUrl = `${explorerSuffix}/tx/${txHash}`;
    const shortHash = getHashShortcut(txHash, 6, 4);
    return (
      <div className="flex flex-col text-sm">
        <div>{toastContent}</div>
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
  };

  const initListData = useCallback(async () => {
    requestListData(1);
  }, [requestListData]);

  const updateListData = useCallback(() => {
    requestListData(listPage);
  }, [listPage, requestListData]);

  const approve = async (
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
  };


  const handleOrderActionSuccess = () => {
    setIsModalActionLoading(false);
    setIsModalOpen(false);
    updateListData();
  };

  const handleDepositAirdropToken = async (
    marketId: string,
    orderId: string,
    airdropAmount: string
  ) => {
    if (currentChainContracts && address) {
      setIsModalActionLoading(true);
      const wethContract = Erc20Abi__factory.connect(
        currentChainContracts.weth.address,
        signer
      );
      const simpleFactoryContract = SimpleFactory__factory.connect(
        currentChainContracts.simpleFactory.address,
        signer
      );
      const marketInfo = await simpleFactoryContract.getMarketInfo(marketId);
      const simpleCoreContract = SimpleCore__factory.connect(
        marketInfo.market,
        signer
      );
      const spendAirdropAmount = parseUnits(`${airdropAmount}`, 18);
      const isApproveSuccessful = await approve(
        wethContract,
        marketInfo.market,
        spendAirdropAmount,
        address
      );
      if (!isApproveSuccessful) {
        console.log("approve failed");
        return;
      }
      const orderIdParams = BigInt(orderId);
      const depositResult = await simpleCoreContract.depoiste(orderIdParams, {
        gasLimit: 700000,
      });
      const depositTx = await depositResult.wait();
      if (depositTx && depositTx.status === TxStatus.SUCCESS) {
        const response = await depositTokenApi({
          userAddress: address,
          marketId: Number(marketId),
          orderIds: [orderId],
        });
        if (response.ok) {
          const data = await response.json();
          console.log("deposit airdrop api data", data);
          toast.success(
            renderToastContent(depositTx.hash, "Deposit token successfully!"),
            {
              position: "top-right",
            }
          );
          handleOrderActionSuccess();
        }
      } else {
        toast.error("Deposit token failed.");
        setIsModalActionLoading(false);
      }
    }
  };

  const renderBuyActionButtons = (
    orderState: OrderStatus,
    order: ListItem,
    isWithdrawn: boolean
  ) => {
    switch (orderState) {
      // my trade page, open status is not existed
      case OrderStatus.Open:
        return <></>;
        break;
      // my trade page, refund status is not existed
      case OrderStatus.Refund:
        return <></>;
        break;
      // my buy trade is matched, can do nothing, wait to claim airdrop
      case OrderStatus.Filled:
        return (
          <div>
            <Button
              className="w-[120px]"
              size="sm"
              color="primary"
              variant="solid"
              isDisabled={true}
            >
              Withdraw
            </Button>
          </div>
        );
        break;
      // seller has deposited airdrop, buy trade wait till market end, claim airdrop
      case OrderStatus.Done:
        return (
          <div>
            <Button
              className="w-[120px]"
              size="sm"
              color="primary"
              variant="solid"
              isDisabled={true}
            >
              Withdraw
            </Button>
          </div>
        );
        break;
      case OrderStatus.Canceled:
        return (
          <div>
            <Button
              className="w-[120px]"
              size="sm"
              color="danger"
              variant="bordered"
              isDisabled={true}
            >
              Cancel
            </Button>
          </div>
        );
        break;
      // my buy trade, seller market has deposited airdrop, claim airdrop
      case OrderStatus.Claimable:
        return (
          <div>
          </div>
        );
        break;
      // market is end, seller didn't deposit airdrop, buyer claim both collateral
      case OrderStatus.Absenteeism:
        return (
          <div>
          </div>
        );
        break;
      case OrderStatus.Closed:
        return <></>;
        break;
      default:
        return <></>;
        break;
    }
  };

  const renderSellActionButtons = (
    orderState: OrderStatus,
    order: ListItem,
    isWithdrawn: boolean
  ) => {
    switch (orderState) {
      // my trade page, open status is not existed
      case OrderStatus.Open:
        return <></>;
        break;
      // my trade page, refund status is not existed
      case OrderStatus.Refund:
        return <></>;
        break;
      // my sell trade is matched, can only deposit
      case OrderStatus.Filled:
        return (
          <div>
            <Button
              className="w-[120px]"
              size="sm"
              color="primary"
              variant="solid"
              onPress={() => {
                console.log("action call, deposit airdrop order");
                handleDepositAirdropToken(
                  order.marketId,
                  order.orderId,
                  order.amount
                );
              }}
            >
              Deposit
            </Button>
          </div>
        );
        break;
      // my sell trade finish deposit airdrop, wait to claim collateral and benefit
      case OrderStatus.Done:
        return (
          <div>
            <Button
              className="w-[120px]"
              size="sm"
              color="primary"
              variant="solid"
              isDisabled={true}
            >
              Withdraw
            </Button>
          </div>
        );
        break;
      // sell trade finish deposit airdrop, market is end, claim collateral and benefit
      case OrderStatus.Claimable:
        return (
          <div>
          </div>
        );
        break;
      case OrderStatus.Canceled:
        return (
          <div>
            <Button
              className="w-[120px]"
              size="sm"
              color="danger"
              variant="bordered"
              isDisabled={true}
            >
              Cancel
            </Button>
          </div>
        );
        break;
      case OrderStatus.Absenteeism:
        return <></>;
        break;
      case OrderStatus.Closed:
        return <></>;
        break;
      default:
        return <></>;
        break;
    }
  };



  const renderTable = () => {
    return (
      <Table
        className="min-h-[580px] text-white"
        aria-label="Example static collection table"
        selectionMode="single"
        removeWrapper
      >
        <TableHeader>
          <TableColumn>Token</TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Market Id</TableColumn>
          <TableColumn>Order Id</TableColumn>
          <TableColumn>Order Type</TableColumn>
          <TableColumn>Price</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn>Collateral</TableColumn>
          <TableColumn>Status</TableColumn>
          <TableColumn>{""}</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={listDataStatus === ListDataStatus.LOADING}
          loadingContent={<Spinner color="secondary" label="" />}
          emptyContent={`No ${orderType} trades for now.`}
        >
          {listData.map((order) => {
            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="relative flex h-[36px] w-[36px]">
                    <div className="h-full w-full rounded-full bg-gray-500">
                      {order.icon && (
                        <Image
                          className="h-full w-full rounded-full"
                          src={order.icon}
                          alt="token"
                        ></Image>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {order.symbol}-Market-{order.marketId}
                </TableCell>
                <TableCell>{order.marketId}</TableCell>
                <TableCell>{order.orderId}</TableCell>
                <TableCell>
                  {orderType === "buy" ? (
                    <span className="w-fit flex py-1 px-3 bg-red-500 rounded-full text-xs">
                      Sell
                    </span>
                  ) : (
                    <span className="w-fit flex py-1 px-3 bg-green-500 rounded-full text-xs">
                      Buy
                    </span>
                  )}
                </TableCell>
                <TableCell>{order.price}</TableCell>
                <TableCell>{order.amount}</TableCell>
                <TableCell>{order.collateralAmount}</TableCell>
                <TableCell>
                  <div
                    className="flex items-center justify-center py-1 px-2 text-xs rounded-full"
                    style={{
                      backgroundColor: order.orderStatusConfig.color,
                    }}
                  >
                    {order.orderStatusConfig.label}
                  </div>
                </TableCell>
                <TableCell>
                  {orderType === "buy"
                    ? renderSellActionButtons(
                        order.orderStatus,
                        order,
                        order.isBidWithdrawed // my trade page, all orders are bid side
                      )
                    : renderBuyActionButtons(
                        order.orderStatus,
                        order,
                        order.isBidWithdrawed // my trade page, all orders are bid side
                      )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const handlePageChange = (page: number) => {
    setListPage(page);
    requestListData(page);
  };

  useEffect(() => {
    initListData();
  }, [initListData]);

  // useEffect(() => {
  //   updateListData();
  // }, [listPage, updateListData]);

  return (
    <div className="rounded-3xl">
      {renderTable()}
      <div className="w-full mb-2">
        {listAllPages > 1 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={listPage}
              total={listAllPages}
              onChange={(page) => handlePageChange(page)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
