#/bin/bash

BASE_PATH="src/types/contracts"

# Clean up
rm -rf $BASE_PATH

# Generate erc20 types
npx typechain --target ethers-v6 --out-dir $BASE_PATH/erc20 "abis/erc20-abi.json"

# Generate monad-premarket core types
npx typechain --target ethers-v6 --out-dir $BASE_PATH/simple-core "abis/simple-core.json"

# Generate monad-premarket factory types
npx typechain --target ethers-v6 --out-dir $BASE_PATH/simple-factory "abis/simple-factory.json"

# Generate monad-premarket helper types
npx typechain --target ethers-v6 --out-dir $BASE_PATH/simple-helper "abis/simple-helper.json"

# Generate monad-premarket governance types
npx typechain --target ethers-v6 --out-dir $BASE_PATH/governance "abis/governance.json"
