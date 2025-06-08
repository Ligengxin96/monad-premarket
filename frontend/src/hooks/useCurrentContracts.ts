import { useChainId, useChains } from "wagmi";
import { ChainConfig } from "@/utils/chainConfig";

export const useCurrentChainContracts = () => {
  const chainId = useChainId();
  const chains = useChains();

  const currentChainConfig = chains.find((chain) => chain.id === chainId) as
    | ChainConfig
    | undefined;

  return { currentChainContracts: currentChainConfig?.contracts };
};
