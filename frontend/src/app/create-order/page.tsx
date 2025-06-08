"use client";
import { ChangeEvent, useEffect, useState, useCallback } from "react";
import type { Selection } from "@heroui/react";
import {
  Card,
  CardBody,
  CardHeader,
  SelectItem,
  Select,
  Button,
  ButtonGroup,
  Tooltip,
  Alert,
  Divider,
  Spinner,
} from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCurrentChainContracts } from "@/hooks/useCurrentContracts";
import { PreMarketItem, preMarketsMap, TxStatus } from "@/utils/constant";
import { toast } from "react-toastify";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { formatUnits, MaxUint256, parseUnits } from "ethers";
import { Erc20Abi__factory } from "@/types/contracts/erc20/factories/Erc20Abi__factory";
import { useAccount } from "wagmi";
import { minOrderCollateral } from "@/utils/constant";
import { SimpleCore__factory } from "@/types/contracts/simple-core";
import clsx from "clsx";
import { useCurrentChainConfig } from "@/hooks/useCurrentChain";
import { getHashShortcut } from "@/utils";
import { preTokenInfo } from "@/utils/chainConfig";
import { BigNumber } from "bignumber.js";

import styles from "./page.module.css";
import { SimpleHelper__factory } from "@/types/contracts/simple-helper";
import { SimpleFactory__factory } from "@/types/contracts/simple-factory";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useTokenInfo } from "@/providers/tokenInfoProvider";

enum OrderStep {
  SETTING,
  CONFIRM,
}

enum OrderType {
  BUY = "buy",
  SELL = "sell",
}

export default function CreateOrder() {
  const router = useRouter();
  const { address } = useAccount();
  const signer = useEthersSigner();
  const { requestPreMarkets, createOrderApi } = useApiRequest();
  const { currentChainContracts } = useCurrentChainContracts();
  const { currentChainConfig } = useCurrentChainConfig();
  const { usdc } = useTokenInfo();
  const [orderType, setOrderType] = useState(OrderType.BUY);
  const [tokenPrice, setTokenPrice] = useState("");
  const [tokenAmount, setTokenAmount] = useState("10");
  const [tokenCollateral, setTokenCollateral] = useState("10");
  const [preTokenList, setPreTokenList] = useState<PreMarketItem[]>([]);
  const [disabledTokes, setDisabledTokes] = useState<string[]>();
  const [step, setStep] = useState<OrderStep>(OrderStep.SETTING);
  const [usdcBalance, setUSDCBalance] = useState("0");
  const [selectedToken, setSelectedToken] = useState<Selection>(new Set([]));
  const [selectedTokenInfo, setSelectedTokenInfo] = useState<PreMarketItem>();
  const [isNextDisabled, setIsNextDisable] = useState(true);
  const [isShowCollateralTip, setIsShowCollateralTip] = useState(false);
  const [isCreateOrderLoading, setIsCreateOrderLoading] = useState(false);

  const onTokenPriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTokenPrice(value);
  };

  const onTokenAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setTokenAmount(value);
  };

  const getUSDCBalance = useCallback(async () => {
    if (currentChainContracts && address && signer) {
      const usdcContract = Erc20Abi__factory.connect(
        currentChainContracts.usdc.address,
        signer
      );
      const usdcBalance = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals();
      console.log("usdcBalance", usdcBalance);
      const usdcReadValue = formatUnits(usdcBalance, decimals);
      setUSDCBalance(Number(usdcReadValue).toFixed(2));
    }
  }, [address, currentChainContracts, signer]);

  const handleNextStep = () => {
    // check value
    setStep(OrderStep.CONFIRM);
  };

  const handleClickSelectItem = (token: PreMarketItem) => {
    setSelectedTokenInfo(token);
  };

  const renderToastContent = (txHash: string) => {
    let explorerSuffix = "";
    if (currentChainConfig && currentChainConfig.blockExplorers) {
      explorerSuffix = currentChainConfig.blockExplorers.default.url;
    }
    const txHashUrl = `${explorerSuffix}/tx/${txHash}`;
    const shortHash = getHashShortcut(txHash, 6, 4);
    return (
      <div className="flex flex-col text-sm">
        <div>Create order successfully!</div>
        <div className="flex">
          <span className="flex mr-2">Transaction:</span>
          <a
            className="flex items-center text-gray-500"
            href={txHashUrl}
            target="_blank"
          >
            <div className="flex">{shortHash}</div>
          </a>
        </div>
      </div>
    );
  };

  const approve = async (
    ERC20Contract: any,
    spender: string,
    amount: bigint,
    owner: string
  ) => {
    if (currentChainContracts) {
      try {
        const allowance = await ERC20Contract.allowance(owner, spender);
        if (allowance < amount) {
          const approve = await ERC20Contract.approve(spender, MaxUint256, {
            gasLimit: 200000,
          });
          await approve.wait();
        }
        return true;
      } catch (e) {
        toast.error("Approve failed.", {
          position: "top-center",
        });
        console.error("Approve erorr:", e);
        return false;
      }
    }
  };

  const createOrder = async () => {
    console.log("selectedTokenInfo", selectedTokenInfo);
    setIsCreateOrderLoading(true);
    try {
      if (selectedTokenInfo && currentChainContracts && address && usdc) {
        const simpleFactoryContract = SimpleFactory__factory.connect(
          currentChainContracts.simpleFactory.address,
          signer
        );
        const marketInfo = await simpleFactoryContract.getMarketInfo(
          selectedTokenInfo.marketId
        );
        const marketAddress = marketInfo.market;
        const marketContract = SimpleCore__factory.connect(
          marketAddress,
          signer
        );
        const usdcContract = Erc20Abi__factory.connect(
          currentChainContracts.usdc.address,
          signer
        );
        const helperContract = SimpleHelper__factory.connect(
          currentChainContracts.simpleHelper.address,
          signer
        );
        const tradeType = orderType === OrderType.BUY ? 0n : 1n;
        const spendDUSCAmount = parseUnits(tokenCollateral, usdc.decimals);
        const tradeAmount = parseUnits(tokenAmount, 6);
        const tradePrice = parseUnits(tokenPrice, 6);
        // check USDC balance is enough
        if (Number(tokenCollateral) > Number(usdcBalance)) {
          toast.warning(
            <div className="text-sm">
              Insufficient USDC balance. You can mint USDC in the faucet.
            </div>
          );
          router.push("/faucet");
          return;
        }
        const isApproveSuccessful = await approve(
          usdcContract,
          marketAddress,
          spendDUSCAmount,
          address
        );
        if (!isApproveSuccessful) {
          setIsCreateOrderLoading(false);
          return;
        }
        console.log("put trade params");
        console.log("tradeType", tradeType);
        console.log("tradeAmount", tradeAmount);
        console.log("tradePrice", tradePrice);
        console.log("market address", marketAddress);
        const createOrderResult = await marketContract.createOrder(
          tradeType,
          tradeAmount,
          tradePrice,
          { gasLimit: 600000 }
        );
        const createOrderTx = await createOrderResult.wait();
        if (createOrderTx && createOrderTx.status === TxStatus.SUCCESS) {
          const latestOrderId = await helperContract.getLastestOrderId(
            selectedTokenInfo.marketId
          );
          console.log("latestOrderId", latestOrderId);
          const response = await createOrderApi({
            userAddress: address,
            marketId: Number(selectedTokenInfo.marketId),
            orderId: `${Number(latestOrderId) - 1}`,
          });
          if (response.ok) {
            const data = await response.json();
            console.log("create order api data", data);
            toast.success(renderToastContent(createOrderTx.hash), {
              position: "top-right",
            });
            setIsCreateOrderLoading(false);
          }
        } else {
          // create order failed
          toast.error("Create order failed.");
          setIsCreateOrderLoading(false);
        }
      }
    } catch (error) {
      console.error("create order error", error);
      toast.error("Create order failed, try again later.");
      setIsCreateOrderLoading(false);
    }
  };

  const handleOrderType = (selectOrderType: OrderType) => {
    setOrderType(selectOrderType);
  };

  const init = useCallback(async () => {
    getUSDCBalance();
    const listResponse = await requestPreMarkets({ page: 1 });
    if (listResponse.ok) {
      const responseData = await listResponse.json();
      const endTokens: string[] = [];
      const preTokenList = responseData.list.map((token: any) => {
        const marketInfo = preMarketsMap[token.symbol];
        const currentTime = new Date().getTime();
        const endTime = Number(token.endTime) * 1000;
        if (currentTime > endTime) {
          endTokens.push(token.marketId.toString());
        }
        return {
          key: token.marketId.toString(),
          marketId: token.marketId,
          symbol: token.symbol,
          icon: marketInfo ? marketInfo.icon : "",
        };
      });
      setDisabledTokes(endTokens);
      setPreTokenList(preTokenList);
    }
  }, [getUSDCBalance, requestPreMarkets]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const tokenCollateralNumber = Number(tokenCollateral);
    const selectedArray = Array.from(selectedToken);
    if (
      tokenPrice &&
      tokenAmount &&
      selectedArray.length > 0 &&
      tokenCollateralNumber >= minOrderCollateral
    ) {
      setIsNextDisable(false);
    } else {
      setIsNextDisable(true);
    }
  }, [selectedToken, tokenAmount, tokenCollateral, tokenPrice]);

  useEffect(() => {
    const totalCollateral = BigNumber(tokenPrice)
      .multipliedBy(tokenAmount)
      .toFixed();
    setTokenCollateral(totalCollateral == "NaN" ? "0" : totalCollateral);
    if (Number(totalCollateral) < minOrderCollateral) {
      setIsShowCollateralTip(true);
    } else {
      setIsShowCollateralTip(false);
    }
  }, [tokenPrice, tokenAmount]);

  return (
    <div className="h-full w-full flex justify-center  pt-10 px-16">
      <Card className="w-[544px] h-fit text-white">
        <CardHeader>Order Settings</CardHeader>
        <CardBody>
          {step === OrderStep.SETTING && (
            <div>
              <ButtonGroup size="lg" fullWidth>
                <Button
                  onPress={() => handleOrderType(OrderType.BUY)}
                  className={clsx(
                    "border border-transparent",
                    orderType === OrderType.BUY ? styles.selectedBuyButton : ""
                  )}
                >
                  BUY ORDER
                </Button>
                <Divider orientation="vertical" className="my-4" />
                <Button
                  onPress={() => handleOrderType(OrderType.SELL)}
                  className={clsx(
                    "border border-transparent",
                    orderType === OrderType.SELL
                      ? styles.selectedSellButton
                      : ""
                  )}
                >
                  SELL ORDER
                </Button>
              </ButtonGroup>
              <div className="p-4 bg-[#242425] rounded-lg mt-4">
                <div className="text-xs text-white/30 mb-2">
                  PRICE PER TOKEN
                </div>
                <div className="flex items-center gap-2 text-2xl text-white/10">
                  <span className="flex">$</span>
                  <input
                    autoFocus
                    className="border-none outline-none bg-transparent font-medium text-left text-white"
                    onChange={onTokenPriceChange}
                    placeholder="Enter Your Price"
                    value={tokenPrice}
                  />
                </div>
              </div>
              <div className="relative w-full flex flex-col mt-4">
                <div className="flex flex-col w-ful bg-[#242425] rounded-lg p-4 mb-1">
                  <div className="mb-2 text-xs">AMOUNT</div>
                  <div className="h-[40px] flex items-center justify-between">
                    <input
                      autoFocus
                      className="flex-1 border-none outline-none bg-transparent text-2xl font-medium text-left text-white"
                      onChange={onTokenAmountChange}
                      placeholder="Enter Amount"
                      value={tokenAmount}
                    />
                    <Select
                      size="sm"
                      className="w-[200px]"
                      label="Select a market"
                      selectedKeys={selectedToken}
                      disabledKeys={disabledTokes}
                      onSelectionChange={setSelectedToken}
                    >
                      {preTokenList.map((token) => (
                        <SelectItem
                          key={token.key}
                          textValue={token.symbol}
                          onPress={() => handleClickSelectItem(token)}
                        >
                          <div className="flex gap-2">
                            <div className="h-[20px] w-[20px] rounded-full bg-gray-500">
                              {token.icon && (
                                <Image
                                  className="h-[20px] w-[20px] rounded-full"
                                  width={20}
                                  height={20}
                                  src={token.icon}
                                  alt="token"
                                ></Image>
                              )}
                            </div>
                            {token.symbol}
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col w-ful bg-[#242425] rounded-lg p-4">
                  <div className="flex justify-between mb-2 text-xs">
                    <span>COLLATERAL</span>
                    <div className="flex gap-1">
                      Balance:{" "}
                      <span className="text-white">{usdcBalance} USDC</span>
                    </div>
                  </div>
                  <div className="h-[40px] flex items-center justify-between">
                    <input
                      autoFocus
                      className="border-none outline-none bg-transparent text-2xl font-medium text-left text-white"
                      placeholder="0.00"
                      value={tokenCollateral}
                      disabled
                    />
                    <div className="flex items-center gap-2">
                     
                      USDC
                    </div>
                  </div>
                </div>
                {isShowCollateralTip && (
                  <Alert
                    className="mt-4"
                    color="warning"
                    title="The order value must exceed $10."
                  />
                )}
                <div className="absolute z-10 left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] rounded-full bg-[#242425] p-1 border-2 border-[rgb(24,24,27)]">
                </div>
              </div>
              <Button
                className="w-full text-2xl font-bold mt-4"
                size="lg"
                color="secondary"
                onPress={handleNextStep}
                isDisabled={isNextDisabled}
              >
                Next
              </Button>
            </div>
          )}
          {step === OrderStep.CONFIRM && (
            <div>
              <div className="w-full flex flex-col border border-white/10 rounded-lg text-white/30 text-sm">
                <div className="flex justify-between px-4 py-3 border-b border-white/10 ">
                  <div className="flex items-center">
                    Offer Type
                    <Tooltip
                      placement="top"
                      showArrow={true}
                      content={
                        <div className="w-[160px] text-sm text-[rgba(0,0,0,0.5)]">
                          Type of the order that you will create.
                        </div>
                      }
                    >
                      <div className="ml-1">
                      </div>
                    </Tooltip>
                  </div>
                  {orderType === OrderType.BUY ? (
                    <div className="flex items-center text-green-500">
                      WANT TO BUY
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      WANT TO SELL
                    </div>
                  )}
                </div>
                <div className="flex justify-between px-4 py-3 border-b border-white/10 ">
                  <div className="flex items-center">
                    Price
                    <Tooltip
                      placement="top"
                      showArrow={true}
                      content={
                        <div className="w-[160px] text-sm text-[rgba(0,0,0,0.5)]">
                          The price that you will buy the token for.
                        </div>
                      }
                    >
                      <div className="ml-1">
                      </div>
                    </Tooltip>
                  </div>
                  <div className="flex items-center text-white/80">
                    $ {tokenPrice}
                  </div>
                </div>
                <div className="flex justify-between px-4 py-3 border-b border-white/10 ">
                  <div className="flex items-center">
                    Amount
                    <Tooltip
                      placement="top"
                      showArrow={true}
                      content={
                        <div className="w-[160px] text-sm text-[rgba(0,0,0,0.5)]">
                          The amount of the token that you will buy.
                        </div>
                      }
                    >
                      <div className="ml-1">
                      </div>
                    </Tooltip>
                  </div>
                  <div className="flex items-center text-white/80">
                    {tokenAmount}
                 
                  </div>
                </div>
                <div className="flex justify-between px-4 py-3 border-b border-white/10 ">
                  <div className="flex items-center">
                    For
                    <Tooltip
                      placement="top"
                      showArrow={true}
                      content={
                        <div className="w-[180px] text-sm text-[rgba(0,0,0,0.5)]">
                          The amount of the collateral that you need to pay for
                          this order.
                        </div>
                      }
                    >
                      <div className="ml-1">
                      </div>
                    </Tooltip>
                  </div>
                  <div className="flex items-center text-white/80">
                    $ {tokenCollateral}
             
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onPress={() => {
                    setStep(OrderStep.SETTING);
                    setIsCreateOrderLoading(false);
                  }}
                >
                  Back
                </Button>
                <Button
                  onPress={createOrder}
                  size="lg"
                  className="flex-1"
                  color="secondary"
                  isDisabled={isCreateOrderLoading}
                >
                  <div className="relative">
                    Create Order
                    {isCreateOrderLoading && (
                      <Spinner
                        size="sm"
                        className={clsx(
                          "absolute left-[101%]",
                          styles.spinnerClass
                        )}
                        color="default"
                      />
                    )}
                  </div>
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
