"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Pagination,
} from "@heroui/react";
import { ListDataStatus } from "@/utils/constant";
import { useParams } from "next/navigation";
import { getHashShortcut } from "@/utils";
import dayjs from "dayjs";

// assets
import { useCurrentChainConfig } from "@/hooks/useCurrentChain";
import { useApiRequest } from "@/hooks/useApiRequest";

interface TxHistoryItem {
  id: number;
  timestamp: string;
  pair: string;
  orderId: string;
  orderSide: string;
  asker: string;
  bider: string;
  symbol: string;
  price: string;
  amount: string;
  tokenAddress: string;
  collateralAmount: string;
  collateral: string;
  collateralAddress: string;
  txHash: string;
}

const historyNumberPerPage = 10;

export const TransactionHistoryComponent = () => {
  const { currentChainConfig } = useCurrentChainConfig();
  const params = useParams();
  const { requestMarketTradesApi } = useApiRequest();
  const [listDataStatus, setlistDataStatus] = useState<ListDataStatus>(
    ListDataStatus.LOADING
  );
  const [historyListData, setHistoryListData] = useState<TxHistoryItem[]>([]);
  const [tradeHistoryPage, setTradeHistoryPage] = useState(1);
  const [tradeHistoryAllPages, setTradeHistoryAllPages] = useState(1);

  const getTxHistoryList = useCallback(async () => {
    const marketId = params.id as string;
    try {
      setlistDataStatus(ListDataStatus.LOADING);
      setHistoryListData([]);
      const response = await requestMarketTradesApi({
        marketId: Number(marketId),
        page: tradeHistoryPage,
        // userAddress: address || zeroAddress,
      });
      if (response.ok) {
        const data = await response.json();
        console.log("trade history data", data);
        const allPages = Math.ceil(data.data.count / historyNumberPerPage);
        const list = data.data.list.map((trade: any) => {
          const formatedTime = dayjs(Number(trade.timestamp) * 1000).format(
            "YYYY-MM-DD HH:mm"
          );
          return {
            id: trade.id,
            timestamp: formatedTime,
            pair: `${trade.symbol}/USDC`,
            orderId: trade.orderId,
            orderSide: trade.orderSide,
            asker: trade.asker,
            bider: trade.bider,
            symbol: trade.symbol,
            price: trade.price,
            amount: trade.amount,
            collateralAmount: trade.collateralAmount,
            // collateral: string;
            // collateralAddress: string;
            txHash: trade.hash,
          };
        });
        setTradeHistoryAllPages(allPages);
        setHistoryListData(list);
        setlistDataStatus(ListDataStatus.SUCCESS);
      }
    } catch (error) {
      console.error("fetch trade history failed", error);
      setlistDataStatus(ListDataStatus.EMPTY);
    }
  }, [params.id, requestMarketTradesApi, tradeHistoryPage]);

  const renderHistoryTable = () => {
    return (
      <Table
        className="min-h-[420px]"
        removeWrapper
        aria-label="Example static collection table"
      >
        <TableHeader className="text-xs">
          <TableColumn>Time</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn>Pair</TableColumn>
          <TableColumn>Price($)</TableColumn>
          <TableColumn>Amount</TableColumn>
          <TableColumn>Collateral </TableColumn>
          <TableColumn>TxHash </TableColumn>
        </TableHeader>
        <TableBody
          isLoading={listDataStatus === ListDataStatus.LOADING}
          loadingContent={<Spinner label="" />}
          emptyContent={"No transaction data for now."}
        >
          {historyListData.map((txHistory, index) => {
            const {
              timestamp,
              orderSide,
              pair,
              amount,
              price,
              collateralAmount,
              txHash,
            } = txHistory;
            return (
              <TableRow className="text-white text-sm" key={index}>
                <TableCell className="text-xs">{timestamp}</TableCell>
                <TableCell>
                  {orderSide === "buy" ? (
                    <span className="w-fit flex py-1 px-3 bg-green-500 rounded-full text-xs">
                      Buy
                    </span>
                  ) : (
                    <span className="w-fit flex py-1 px-3 bg-red-500 rounded-full text-xs">
                      Sell
                    </span>
                  )}
                </TableCell>
                <TableCell>{pair}</TableCell>
                <TableCell>{price}</TableCell>
                <TableCell>{amount}</TableCell>
                <TableCell>{collateralAmount}</TableCell>
                <TableCell>
                  <a
                    className="flex gap-1"
                    href={`${currentChainConfig?.blockExplorers?.default.url}/tx/${txHash}`}
                    target="_blank"
                  >
                    {getHashShortcut(txHash, 6, 4)}
                  </a>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  useEffect(() => {
    getTxHistoryList();
  }, [tradeHistoryPage, getTxHistoryList]);

  useEffect(() => {
    getTxHistoryList();
  }, [getTxHistoryList]);

  return (
    <div className="rounded-3xl">
      {renderHistoryTable()}
      <div className="w-full mb-2">
        {tradeHistoryAllPages > 1 ? (
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={tradeHistoryPage}
              total={tradeHistoryAllPages}
              onChange={(page) => setTradeHistoryPage(page)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
