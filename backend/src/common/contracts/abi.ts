import { ethers } from "ethers";
import ERC20 from './abis/ERC20.json';
import Governance from './abis/Governance.json';
import SimpleFactory from './abis/SimpleFactory.json';
import Helper from './abis/Helper.json';
import SimpleMarketCore from './abis/SimpleMarketCore.json';

export const ERC20Abi = ERC20.abi;
export const ERC20Interface = new ethers.Interface(ERC20Abi);

export const GovernanceAbi = Governance.abi;
export const GovernanceInterface = new ethers.Interface(GovernanceAbi);

export const SimpleFactoryAbi = SimpleFactory.abi;
export const SimpleFactoryInterface = new ethers.Interface(SimpleFactoryAbi);

export const HelperAbi = Helper.abi;
export const HelperInterface = new ethers.Interface(HelperAbi);

export const SimpleMarketCoreAbi = SimpleMarketCore.abi;
export const SimpleMarketCoreInterface = new ethers.Interface(SimpleMarketCoreAbi);
