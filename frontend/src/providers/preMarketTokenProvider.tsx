"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { multicall } from "@wagmi/core";
import { config } from "@/app/wagmi";

import { ChainConfig } from "@/utils/chainConfig";
import { useCurrentChainConfig } from "@/hooks/useCurrentChain";
import { erc20Abi } from "../../abis/erc20-abi";
import { requestPreMarkets } from "@/api/pre-markets";

export interface TokenInfo {
  decimal: number;
  marketId: number;
  marketAddress: string;
  icon: string;
  lastPrice: string;
  endTime: string;
  vol24h: string;
  volTotal: string;
  priceChange24h: {
    maxPrice: string;
    minPrice: string;
  };
}

interface PreMarketTokenContextType {
  tokenList: TokenInfo[] | undefined;
}

const PreMarketTokenContext = createContext<
  PreMarketTokenContextType | undefined
>(undefined);

export const PreMarketTokenProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentChainConfig } = useCurrentChainConfig();
  const [tokenList, setTokenList] = useState<TokenInfo[] | undefined>();

  const getTokenList = useCallback(async () => {
    // const preMarketList = await requestPreMarkets({
    //   page: 1,
    // });
    // console.log("preMarketList", preMarketList);
  }, []);

  useEffect(() => {
    getTokenList();
  }, [getTokenList]);

  return (
    <PreMarketTokenContext.Provider
      value={{
        tokenList,
      }}
    >
      {children}
    </PreMarketTokenContext.Provider>
  );
};

export const usePreMarketToken = () => {
  const context = useContext(PreMarketTokenContext);
  if (context === undefined) {
    throw new Error("useTokenInfo must be used within an TokenInfoProvider");
  }
  return context;
};
