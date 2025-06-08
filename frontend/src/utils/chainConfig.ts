import { defineChain, type Chain } from "viem";

// abi
import { erc20Abi } from "../../abis/erc20-abi";
import { simpleCoreAbi } from "../../abis/simple-core";
import { simpleFactoryAbi } from "../../abis/simple-factory";
import { simpleHelperAbi } from "../../abis/simple-helper";
import { governanceAbi } from "../../abis/governance";


export interface ChainConfig extends Chain {
  icon: any;
  contracts: {
    usdc: {
      address: `0x${string}`;
      abi: typeof erc20Abi;
    };
    weth: {
      address: `0x${string}`;
      abi: typeof erc20Abi;
    };
    governance: {
      address: `0x${string}`;
      abi: typeof governanceAbi;
    };
    simpleFactory: {
      address: `0x${string}`;
      abi: typeof simpleFactoryAbi;
    };
    simpleHelper: {
      address: `0x${string}`;
      abi: typeof simpleHelperAbi;
    };
    simpleCore: {
      address: `0x${string}`;
      abi: typeof simpleCoreAbi;
    };
  };
}

// test env chain config
export const monadTestnet: ChainConfig = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Testnet Scan",
      url: "https://monad-testnet.socialscan.io/",
    },
  },
  contracts: {
    usdc: {
      address: "0xda7311c0D07f9c4Ed4E5b64f091665847E30d54c",
      abi: erc20Abi,
    },
    weth: {
      address: "0x5E218196b521d073C24051c1d9bdd860B8049721",
      abi: erc20Abi,
    },
    governance: {
      address: "0x07dEbc8B45D48eBe00DdCbA4d99647d741F0Bb5b",
      abi: governanceAbi,
    },
    simpleFactory: {
      address: "0x04971300E9625986945dC61d13342F2fEFE0cc9e",
      abi: simpleFactoryAbi,
    },
    simpleHelper: {
      address: "0x2b4dBc3023280F3D6af4355EDAA538661B29AE36",
      abi: simpleHelperAbi,
    },
    simpleCore: {
      address: "0x4683d452cd15511c5C229FB46F8a50EF3EdAf192",
      abi: simpleCoreAbi,
    },
  },
  icon: ''
});

export interface preTokenInfo {
  symbol: string;
  decimal: number;
  marketId: number;
  marketAddress: string;
  icon: string;
  lastPrice: string;
  startTime: string;
  endTime: string;
  vol24h: string;
  volTotal: string;
  priceChange24h: {
    maxPrice: string;
    minPrice: string;
  };
}
