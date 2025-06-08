// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;
interface ISimpleMarketCore {

    enum OrderType{
        buy, 
        sell
    }

    enum OrderState{
        inexistence, 
        buying, 
        selling, 
        found, 
        fail, 
        done
    }

    struct OrderInfo{
        OrderType orderType;
        OrderState state;
        bytes1 creatorWithdrawState;
        bytes1 traderWithdrawState;
        address trader;
        address creator;
        uint64 price;
        uint256 targetTokenAmount;
        uint256 collateralAmount;
        uint256 creationTime;
    }

    struct UserInfo{
        uint256[] buyIdGroup;
        uint256[] sellIdGroup;
    }

    event CreateOrder(uint256 indexed id, address creator, uint256 total);
    event MatchOrder(uint256 indexed id);
    event CancelOrder(uint256 indexed id);
    event DepositeOrder(uint256 indexed id);
    event RefundOrder(uint256 indexed id);
    event WithdrawOrder(uint256 indexed id, OrderType thisOrderType);
    event WithdrawLiquidatedDamage(uint256 indexed id);

    error InvalidUser();
    error InvalidState(string);

    function currentMarketId() external view returns(uint256);
    function orderId() external view returns(uint256);

    function getOrderInfo(uint256 thisOrderId) external view returns(OrderInfo memory);

    function indexUserBuyId(address user, uint256 index) external view returns(uint256 buyId);

    function indexUserSellId(address user, uint256 index) external view returns(uint256 sellId);

    function getUserBuyIdsLength(address user) external view returns(uint256);

    function getUserSellIdsLength(address user) external view returns(uint256);


}