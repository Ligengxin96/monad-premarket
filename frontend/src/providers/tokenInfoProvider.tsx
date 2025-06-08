"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
} from "react";

import { useCurrentChainConfig } from "@/hooks/useCurrentChain";
import { useCurrentChainContracts } from "@/hooks/useCurrentContracts";

export interface TokenInfo {
  decimals: number;
}

interface TokenContextType {
  usdc: TokenInfo | undefined;
  weth: TokenInfo | undefined;

}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [usdcInfo, setUSDCInfo] = useState<TokenInfo>({
    decimals: 6,
  });
  const [wethInfo, setWETHInfo] = useState<TokenInfo>({
    decimals: 18,
  });

  return (
    <TokenContext.Provider
      value={{
        usdc: usdcInfo,
        weth: wethInfo,
      }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useTokenInfo = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokenInfo must be used within an TokenProvider");
  }
  return context;
};
