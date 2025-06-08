import { getDefaultConfig } from "@rainbow-me/rainbowkit";

import {
  monadTestnet,
} from "@/utils/chainConfig";
import { EnvMode } from "@/utils/constant";

const projectId = "8e191c21ba991e40848e4355139cd3bb";

const environment = process.env.NEXT_PUBLIC_ENV as EnvMode;

export const config = getDefaultConfig({
  appName: "Monad pre-market",
  projectId: projectId,
  chains: [
    monadTestnet,
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
