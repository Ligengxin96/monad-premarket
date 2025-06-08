# Monad Simple Market

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)]

In the decentralized futures market of monad.

## Features
- **Pre-market Trading**: Trade tokens of upcoming projects before they go live.
- **Conduct mainstream Token futures trading**: Conduct transactions of mainstream tokens such as WETH and WBTC.

## How It Works
1. **Order Placement**: Buyers and sellers place orders with specified price and amount in USDC.
2. **Collateral Handling**: Sellers pledge token collateral; buyers lock USDC collateral against orders.
3. **Execution & Settlement**: Orders match off-chain; collateral and tokens settle on-chain at market close.
4. **Pledge & Refund**: Unmatched orders can be canceled before settlement time, subject to cancellation fees.

## Getting Started
### Prerequisites
- Node.js v16+ and npm or Yarn
- Hardhat (v2.22+)

### Installation
```bash
# Clone the repository
git clone git@github.com:Ligengxin96/monad-premarket.git
cd monad-premarket

# Install dependencies
npm install  # or yarn
```

### Configuration
Create a `.env` file with the following variables:
```
Monad_Testnet_RPC=<Your MONAD RPC URL>
PRIVATE_KEY1=<Your deployer account private key>
```

## Usage
```bash


# Deploy contracts via Ignition
npx hardhat run scripts/deploy.js --network monad
```

## License
This project is licensed under the AGPL-3.0 License. See the [LICENSE](LICENSE) file for details.