"use client";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";

import { preTokenInfo } from "@/utils/chainConfig";

// assets
import { ListDataStatus, preMarketsMap } from "@/utils/constant";
import { useAccount } from "wagmi";
import { useApiRequest } from "@/hooks/useApiRequest";

export default function MyTradesMarkets() {
  const { address } = useAccount();
  const router = useRouter();
  const { requestMyTradeMarkets } = useApiRequest();
  const [markets, setMarkets] = useState<preTokenInfo[]>([]);
  const [listDataStatus, setListDataStatus] = useState<ListDataStatus>(
    ListDataStatus.LOADING
  );
  const [tableTips, setTableTips] = useState("");

  const init = useCallback(async () => {
    if (!address) {
      setListDataStatus(ListDataStatus.EMPTY);
      setTableTips("Connect wallet to check your trades.");
      return;
    }
    const response = await requestMyTradeMarkets({
      page: 1,
      userAddress: address,
    });
    console.log("my trade markets response", response);
    if (response.ok) {
      const listData = await response.json();
      console.log("listData", listData);
      const marketList = listData.data.list.map((market: any) => {
        const startTime = dayjs(Number(market.startTime) * 1000).format(
          "YYYY-MM-DD HH:mm"
        );
        const endTime = dayjs(Number(market.endTime) * 1000).format(
          "YYYY-MM-DD HH:mm"
        );
        const marketConfig = preMarketsMap[market.symbol];
        return {
          token: "",
          lastPrice: market.lastPrice,
          vol24h: market.h24Volume,
          volTotal: market.totalVolume,
          startTime,
          endTime,
          symbol: market.symbol,
          marketId: market.marketId,
          marketAddress: market.marketAddress,
          icon: marketConfig ? marketConfig.icon : "",
        };
      });
      console.log("trade marketList", marketList);
      if (marketList.length === 0) {
        setTableTips("No trade markets for now.");
      }
      setMarkets(marketList);
      setListDataStatus(ListDataStatus.SUCCESS);
    }
  }, [address, requestMyTradeMarkets]);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex justify-center text-white pt-10 px-16">
      <Table
        classNames={{
          base: "w-[1000px]",
        }}
        aria-label="Example static collection table"
        selectionMode="single"
      >
        <TableHeader>
          <TableColumn>Token</TableColumn>
          <TableColumn>Name</TableColumn>
          <TableColumn>Market Id</TableColumn>
          <TableColumn>Last Price</TableColumn>
          <TableColumn>Vol 24h</TableColumn>
          <TableColumn>Total Vol</TableColumn>
          <TableColumn>Start Time</TableColumn>
          <TableColumn>End Time</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={listDataStatus === ListDataStatus.LOADING}
          loadingContent={<Spinner color="secondary" label="" />}
          emptyContent={tableTips}
        >
          {markets.map((market) => {
            return (
              <TableRow
                key={market.marketId}
                onClick={() => {
                  console.log("click market", market, market.marketAddress);
                  router.push(
                    `/my-trades/${market.marketId}?marketAddress=${market.marketAddress}`
                  );
                }}
              >
                <TableCell>
                  <div className="relative flex h-[36px] w-[36px]">
                    <div className="h-full w-full rounded-full bg-gray-500">
                      {market.icon && (
                        <Image
                          className="h-full w-full rounded-full"
                          src={market.icon}
                          alt="token"
                        ></Image>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {market.symbol}-Market-{market.marketId}
                </TableCell>
                <TableCell>{market.marketId}</TableCell>
                <TableCell>{market.lastPrice}</TableCell>
                <TableCell>{market.vol24h}</TableCell>
                <TableCell>{market.volTotal}</TableCell>
                <TableCell>{market.startTime}</TableCell>
                <TableCell>{market.endTime}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
