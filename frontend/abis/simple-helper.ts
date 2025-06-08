export const simpleHelperAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_governance",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_simpleFactory",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_governance",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_simpleFactory",
        "type": "address"
      }
    ],
    "name": "changeConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "total",
        "type": "uint256"
      }
    ],
    "name": "getFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_thisFee",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLastestMarketId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      }
    ],
    "name": "getLastestOrderId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "pageIndex",
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
        "internalType": "struct ISimpleFactory.MarketInfo[]",
        "name": "marketInfoGroup",
        "type": "tuple[]"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "waitToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "collateral",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "endTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct IGovernance.MarketConfig[]",
        "name": "marketConfigGroup",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pageIndex",
        "type": "uint256"
      }
    ],
    "name": "getMarketOrderInfos",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum ISimpleMarketCore.OrderType",
            "name": "orderType",
            "type": "uint8"
          },
          {
            "internalType": "enum ISimpleMarketCore.OrderState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "bytes1",
            "name": "creatorWithdrawState",
            "type": "bytes1"
          },
          {
            "internalType": "bytes1",
            "name": "traderWithdrawState",
            "type": "bytes1"
          },
          {
            "internalType": "address",
            "name": "trader",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "price",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "targetTokenAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collateralAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "creationTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct ISimpleMarketCore.OrderInfo[]",
        "name": "orderInfoGroup",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "getOrderInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum ISimpleMarketCore.OrderType",
            "name": "orderType",
            "type": "uint8"
          },
          {
            "internalType": "enum ISimpleMarketCore.OrderState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "bytes1",
            "name": "creatorWithdrawState",
            "type": "bytes1"
          },
          {
            "internalType": "bytes1",
            "name": "traderWithdrawState",
            "type": "bytes1"
          },
          {
            "internalType": "address",
            "name": "trader",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "price",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "targetTokenAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collateralAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "creationTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct ISimpleMarketCore.OrderInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "orderId",
        "type": "uint256"
      }
    ],
    "name": "getOrderState",
    "outputs": [
      {
        "internalType": "enum Helper.OrderCurrentState",
        "name": "state",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "internalType": "uint256[]",
        "name": "orderIds",
        "type": "uint256[]"
      }
    ],
    "name": "getOrdersInfo",
    "outputs": [
      {
        "internalType": "enum Helper.OrderCurrentState[]",
        "name": "orderCurrentStateGroup",
        "type": "uint8[]"
      },
      {
        "components": [
          {
            "internalType": "enum ISimpleMarketCore.OrderType",
            "name": "orderType",
            "type": "uint8"
          },
          {
            "internalType": "enum ISimpleMarketCore.OrderState",
            "name": "state",
            "type": "uint8"
          },
          {
            "internalType": "bytes1",
            "name": "creatorWithdrawState",
            "type": "bytes1"
          },
          {
            "internalType": "bytes1",
            "name": "traderWithdrawState",
            "type": "bytes1"
          },
          {
            "internalType": "address",
            "name": "trader",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "uint64",
            "name": "price",
            "type": "uint64"
          },
          {
            "internalType": "uint256",
            "name": "targetTokenAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "collateralAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "creationTime",
            "type": "uint256"
          }
        ],
        "internalType": "struct ISimpleMarketCore.OrderInfo[]",
        "name": "orderInfoGroup",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "getTokenDecimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "pageIndex",
        "type": "uint256"
      }
    ],
    "name": "getUserJoinMarkets",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "marketIds",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserTokenBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "governance",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "pageIndex",
        "type": "uint16"
      }
    ],
    "name": "indexUserBuyIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "buyIdGroup",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "marketId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "pageIndex",
        "type": "uint16"
      }
    ],
    "name": "indexUserSellIds",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "sellIdGroup",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "simpleFactory",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
