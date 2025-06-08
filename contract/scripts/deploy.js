const hre = require("hardhat");
const fs = require("fs");

const GovernanceABI = require("../artifacts/contracts/core/Governance.sol/Governance.json");
const SimpleFactoryABI = require("../artifacts/contracts/core/SimpleFactory.sol/SimpleFactory.json");
const SimpleMarketABI = require("../artifacts/contracts/core/SimpleMarketCore.sol/SimpleMarketCore.json");
const HelperABI = require("../artifacts/contracts/helper/Helper.sol/Helper.json");
const ERC20ABI = require("../artifacts/contracts/TestToken.sol/TestToken.json");

async function main() {
  const [owner, user1] = await hre.ethers.getSigners();
  console.log("owner:", owner.address);

  const provider = ethers.provider;
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  console.log("Chain ID:", chainId);

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  let config = {};

  async function sendETH(toAddress, amountInEther) {
    const amountInWei = ethers.parseEther(amountInEther);
    const tx = {
      to: toAddress,
      value: amountInWei,
    };
    const transactionResponse = await owner.sendTransaction(tx);
    await transactionResponse.wait();
    console.log("Transfer eth success");
  }

  let allAddresses = {};
  // const usdc = await ethers.getContractFactory("TestToken");
  // const USDC = await usdc.deploy("Simple Market Test USDC", "USDC", 6);
  // const USDCAddress = await USDC.target;
  const USDCAddress = "0xda7311c0D07f9c4Ed4E5b64f091665847E30d54c";
  console.log("USDC Address:", USDCAddress);

  // const testToken = await ethers.getContractFactory("TestToken");
  // const WETH = await testToken.deploy("Test WETH Token", "WETH", 18);
  // const WETHAddress = await WETH.target;
  const WETHAddress = "0x5E218196b521d073C24051c1d9bdd860B8049721";
  console.log("WETH Address:", WETHAddress);

  const governance = await ethers.getContractFactory("Governance");
  const Governance = await governance.deploy(
    owner.address,
    owner.address,
    USDCAddress,
    owner.address
  );
  const GovernanceAddress = await Governance.target;
  // const GovernanceAddress = "";
  // const Governance = new ethers.Contract(
  //   GovernanceAddress,
  //   GovernanceABI.abi,
  //   owner
  // );
  console.log("Governance Address:", GovernanceAddress);

  const setMarketConfig = await Governance.setMarketConfig(
    0,
    864000n,
    WETHAddress,
    { gasLimit: 100000 }
  );
  const setMarketConfigTx = await setMarketConfig.wait();
  console.log("setMarketConfigTx:", setMarketConfigTx.hash);

  const getMarketConfig = await Governance.getMarketConfig(0);
  console.log("getMarketConfig:", getMarketConfig);

  const simpleFactory = await ethers.getContractFactory("SimpleFactory");
  const SimpleFactory = await simpleFactory.deploy(GovernanceAddress);
  const SimpleFactoryAddress = await SimpleFactory.target;
  // const SimpleFactoryAddress = "";
  // const SimpleFactory = new ethers.Contract(SimpleFactoryAddress, SimpleFactoryABI.abi, owner);
  console.log("SimpleFactory Address:", SimpleFactoryAddress);

  const changeSimpleFactory = await Governance.changeSimpleFactory(
    SimpleFactoryAddress
  );
  const changeSimpleFactoryTx = await changeSimpleFactory.wait();
  console.log("changeSimpleFactoryTx:", changeSimpleFactoryTx.hash);

  // const helper = await ethers.getContractFactory("Helper");
  // const Helper = await helper.deploy(GovernanceAddress, SimpleFactoryAddress);
  // const HelperAddress = await Helper.target;
  const HelperAddress = "0x2b4dBc3023280F3D6af4355EDAA538661B29AE36";
  const Helper = new ethers.Contract(HelperAddress, HelperABI.abi, owner);
  console.log("Helper Address:", HelperAddress);

  const changeConfig = await Helper.changeConfig(
    GovernanceAddress,
    SimpleFactoryAddress
  );
  const changeConfigTx = await changeConfig.wait();
  console.log("changeConfigTx:", changeConfigTx.hash);

  const createMarket1 = await SimpleFactory.createMarket({
    gasLimit: 5200000,
  });
  const createMarket1Tx = await createMarket1.wait();
  console.log("createMarket1 tx:", createMarket1Tx.hash);

  const getMarketInfo1 = await SimpleFactory.getMarketInfo(0n);
  console.log("getMarketInfo1:", getMarketInfo1);

  // const createMarket2 = await SimpleFactory.createMarket(
  //   {gasLimit: 5200000}
  // );
  // const createMarket2Tx = await createMarket2.wait();
  // console.log("createMarket2 tx:", createMarket2Tx.hash);

  const getMarketInfo2 = await SimpleFactory.getMarketInfo(1n);
  console.log("getMarketInfo2:", getMarketInfo2);

  const marketId = await SimpleFactory.marketId();
  console.log("lastest marketId:", marketId);

  const Market = new ethers.Contract(
    getMarketInfo1[0],
    SimpleMarketABI.abi,
    owner
  );

  async function Approve(token, tokenOwner, spender, amount) {
    try {
      const tokenContract = new ethers.Contract(
        token,
        ERC20ABI.abi,
        tokenOwner
      );
      const allowance = await tokenContract.allowance(
        tokenOwner.address,
        spender
      );
      if (allowance < ethers.parseEther("10000")) {
        const approve = await tokenContract.approve(spender, amount);
        const approveTx = await approve.wait();
        console.log("approveTx:", approveTx.hash);
      } else {
        console.log("Not approve");
      }
    } catch (e) {
      console.log("e:", e);
    }
  }

  await Approve(
    USDCAddress,
    owner,
    getMarketInfo1[0],
    ethers.parseEther("1000000000")
  );

  // const setMarketConfig2 = await Governance.setMarketConfig(
  //   1,
  //   864000n,
  //   WETHAddress
  // );
  // const setMarketConfig2Tx = await setMarketConfig2.wait();
  // console.log("setMarketConfig2Tx:", setMarketConfig2Tx.hash);

  const OrderType = {
    buy: 0,
    sell: 1,
  };

  const createOrder = await Market.createOrder(
    OrderType.sell,
    100n * 10n ** 6n,
    2n * 10n ** 5n,
    { gasLimit: 800000 }
  );
  const createOrderTx = await createOrder.wait();
  console.log("createOrder:", createOrderTx.hash);

  ///test

  // const createOrder2 = await Market.createOrder(
  //   OrderType.buy,
  //   100n * 10n ** 6n,
  //   2n * 10n ** 5n,
  //   { gasLimit: 800000 }
  // );
  // const createOrder2Tx = await createOrder2.wait();
  // console.log("createOrder2:", createOrder2Tx.hash);

  // const createOrder3 = await Market.createOrder(
  //   OrderType.buy,
  //   100n * 10n ** 6n,
  //   2n * 10n ** 5n,
  //   { gasLimit: 800000 }
  // );
  // const createOrder3Tx = await createOrder3.wait();
  // console.log("createOrder3:", createOrder3Tx.hash);

  // const UserMarket = new ethers.Contract(
  //   getMarketInfo1[0],
  //   SimpleMarketABI.abi,
  //   user1
  // );

  // async function Mint(token, receiver) {
  //   try {
  //     const tokenContract = new ethers.Contract(token, ERC20ABI.abi, receiver);
  //     const mint = await tokenContract.mint(
  //       receiver.address,
  //       ethers.parseEther("100000000000")
  //     );
  //     const mintTx = await mint.wait();
  //     console.log("Mint tx:", mintTx.hash);
  //   } catch (e) {
  //     console.log("Mint fail");
  //   }
  // }
  // await Mint(USDCAddress, user1);
  // await Mint(WETHAddress, user1);

  // await Approve(
  //   USDCAddress,
  //   user1,
  //   getMarketInfo1[0],
  //   ethers.parseEther("1000000000")
  // );
  // await Approve(
  //   WETHAddress,
  //   user1,
  //   getMarketInfo1[0],
  //   ethers.parseEther("1000000000")
  // );
  // await Approve(
  //   WETHAddress,
  //   owner,
  //   getMarketInfo1[0],
  //   ethers.parseEther("1000000000000")
  // );

  // const matchOrder1 = await UserMarket.matchOrder(OrderType.buy, 0);
  // const matchOrder1Tx = await matchOrder1.wait();
  // console.log("matchOrder1 Tx:", matchOrder1Tx.hash);

  // const matchOrder2 = await UserMarket.matchOrder(OrderType.sell, 2);
  // const matchOrder2Tx = await matchOrder2.wait();
  // console.log("matchOrder2 Tx:", matchOrder2Tx.hash);

  // const cancel1 = await Market.cancel(1);
  // const cancel1Tx = await cancel1.wait();
  // console.log("cancel tx:", cancel1Tx.hash);

  // const depoiste1 = await Market.depoiste(0);
  // const depoiste1Tx = await depoiste1.wait();
  // console.log("depoiste1 tx:", depoiste1Tx.hash);

  config.Network = network.name;
  config.USDC = USDCAddress;
  config.WETH = WETHAddress;
  (config.Governance = GovernanceAddress),
    (config.SimpleFactory = SimpleFactoryAddress),
    (config.Helper = HelperAddress);
  (config.market0 = getMarketInfo1[0]),
    // (config.market1 = getMarketInfo2[0]),
    (config.updateTime = new Date().toISOString());

  const filePath = "./deployedAddress.json";
  if (fs.existsSync(filePath)) {
    allAddresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  allAddresses[chainId] = config;

  fs.writeFileSync(filePath, JSON.stringify(allAddresses, null, 2), "utf8");
  console.log("deployedAddress.json update:", allAddresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
