export const simpleFactoryAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_governance",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "market",
        "type": "address"
      }
    ],
    "name": "CreateMarket",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "createMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getMarketInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "market",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "createTime",
            "type": "uint64"
          }
        ],
        "internalType": "struct ISimpleFactory.MarketInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
