// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import {IGovernance} from "../interfaces/IGovernance.sol";
import {ISimpleMarketCore} from "../interfaces/ISimpleMarketCore.sol";
import {ISimpleFactory} from "../interfaces/ISimpleFactory.sol";
import {SimpleLibrary} from "../libraries/SimpleLibrary.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract Helper {

    bytes1 private immutable ZEROBYTES1;
    bytes1 private immutable ONEBYTES1 = 0x01;
    address public governance;
    address public simpleFactory;
    address public owner;

    constructor(address _governance, address _simpleFactory){
        governance = _governance;
        simpleFactory = _simpleFactory;
        owner = msg.sender;
    }

    enum OrderCurrentState{
        inexistence,
        trading,
        found,
        refund,
        absenteeism,
        done
    }

    function changeConfig(address _governance, address _simpleFactory) external {
        require(msg.sender == owner, "Non owner");
        governance = _governance;
        simpleFactory = _simpleFactory;
    }

    /**
     * @notice  .Efficient market
     * @dev     .Obtain the latest pre-prepared order id under the market id
     * @param   marketId  .
     */
    function getLastestOrderId(uint256 marketId) public view returns(uint256){
        address market = _getMarket(marketId);
        return ISimpleMarketCore(market).orderId();
    }

    /**
     * @notice  .
     * @dev     .Obtain the latest pre-created market id
     */
    function getLastestMarketId() public view returns(uint256){
        return ISimpleFactory(simpleFactory).marketId();
    } 

    /**
     * @notice  .
     * @dev     .
     * @param   marketId  .
     * @param   orderIds  .
     */
    function getOrdersInfo(uint256 marketId, uint256[] calldata orderIds) external view returns(
        OrderCurrentState[] memory orderCurrentStateGroup,
        ISimpleMarketCore.OrderInfo[] memory orderInfoGroup
    ){
        uint256 len = orderIds.length;
        orderInfoGroup = new ISimpleMarketCore.OrderInfo[](len);
        orderCurrentStateGroup = new OrderCurrentState[](len);
        unchecked {
            for(uint256 i; i<len; i++){
                orderCurrentStateGroup[i] = getOrderState(marketId, orderIds[i]);
                orderInfoGroup[i] = getOrderInfo(marketId, orderIds[i]);
            }
        }
    }

    /**
     * @notice  .
     * @dev     .
     * @param   pageIndex  .
     */
    function getMarketInfo(
        uint256 pageIndex
    ) external view returns(
        ISimpleFactory.MarketInfo[] memory marketInfoGroup,
        IGovernance.MarketConfig[] memory marketConfigGroup
    ){  
        uint256 lastestMarketId = getLastestMarketId();
        if(lastestMarketId > 0){
            require(pageIndex <= lastestMarketId / 10, "Page index overflow");
            uint256 len;
            uint256 currentMarketId;
            if(lastestMarketId <= 10){
                len = lastestMarketId;
            }else {
                if(lastestMarketId % 10 == 0){
                    len = 10;
                }else{
                    len = lastestMarketId % 10;
                }
                if(pageIndex !=0 ){
                    currentMarketId = pageIndex * 10;
                }
            }
            marketInfoGroup = new ISimpleFactory.MarketInfo[](len);
            marketConfigGroup = new IGovernance.MarketConfig[](len);
            unchecked {
                for(uint256 i; i<len; i++){
                    marketInfoGroup[i] = ISimpleFactory(simpleFactory).getMarketInfo(currentMarketId);
                    marketConfigGroup[i] = IGovernance(governance).getMarketConfig(currentMarketId);
                    currentMarketId++;
                }
            }
        }
    }

    /**
     * @notice  .
     * @dev     .
     * @param   marketId  .
     * @param   pageIndex  .
     */
    function getMarketOrderInfos(
        uint256 marketId, 
        uint256 pageIndex
    ) external view returns(ISimpleMarketCore.OrderInfo[] memory orderInfoGroup){
        uint256 lastestOrderId = getLastestOrderId(marketId);
        if(lastestOrderId > 0){
            require(pageIndex <= lastestOrderId / 10, "Page index overflow");
            uint256 len;
            uint256 currentOrderId;
            if(lastestOrderId <= 10){
                len = lastestOrderId;
            }else {
                if(lastestOrderId % 10 == 0){
                    len = 10;
                }else{
                    len = lastestOrderId % 10;
                }
                if(pageIndex !=0 ){
                    currentOrderId = pageIndex * 10;
                }
            }
            orderInfoGroup = new ISimpleMarketCore.OrderInfo[](len);
            unchecked {
                for(uint256 i; i<len; i++){
                    orderInfoGroup[i] = getOrderInfo(marketId, currentOrderId);
                    currentOrderId++;
                }
            }
        }
    }

    /**
     * @notice  .
     * @dev     .
     * @param   marketId  .
     * @param   orderId  .
     */
    function getOrderInfo(uint256 marketId, uint256 orderId) public view returns(ISimpleMarketCore.OrderInfo memory){
        address market = _getMarket(marketId);
        return ISimpleMarketCore(market).getOrderInfo(orderId);
    }

    /**
     * @notice  .
     * @dev     .
     * @param   user  .
     * @param   pageIndex  .
     */
    function getUserJoinMarkets(address user, uint256 pageIndex) external view returns(uint256[] memory marketIds) {
         uint256 joinMarketLen = IGovernance(governance).getUserJoinMarketLength(user);
        if(joinMarketLen > 0){
            require(pageIndex <= joinMarketLen / 10, "Page index overflow");
            uint256 len;
            uint256 indexId;
            if(joinMarketLen <= 10){
                len = joinMarketLen;
            }else {
                if(joinMarketLen % 10 == 0){
                    len = 10;
                }else{
                    len = joinMarketLen % 10;
                }
                if(pageIndex !=0 ){
                    indexId = pageIndex * 10;
                }
            }
            marketIds = new uint256[](len);
            unchecked {
                for(uint256 i; i<len; i++){
                    marketIds[i] = IGovernance(governance).indexUserJoinInfoGroup(user, indexId);
                    indexId++;
                }
            }
        }
    }

    /**
     * @notice  .
     * @dev     .
     * @param   marketId  .
     * @param   user  .
     * @param   pageIndex  .
     */
    function indexUserBuyIds(
        uint256 marketId, 
        address user, 
        uint16 pageIndex
    ) external view returns(uint256[] memory buyIdGroup) {
        uint256 len;
        uint256 currentId;
        address market = _getMarket(marketId);
        uint256 buyIdsLength = ISimpleMarketCore(market).getUserBuyIdsLength(user);
        require(pageIndex <= buyIdsLength / 10, "Page index overflow");
        if(buyIdsLength >0 ){
            if(buyIdsLength <= 10){
                len = buyIdsLength;
            }else {
                if(buyIdsLength % 10 == 0){
                    len = 10;
                }else {
                    len = buyIdsLength % 10;
                }
                if(pageIndex >0 ){
                    currentId = pageIndex* 10;
                }
            }
            buyIdGroup = new uint256[](len);
            unchecked {
                for(uint256 i; i<len; i++){
                    buyIdGroup[i] = currentId;
                    currentId++;
                }
            }
        }
    }

    /**
     * @notice  .
     * @dev     .
     * @param   marketId  .
     * @param   user  .
     * @param   pageIndex  .
     */
    function indexUserSellIds(
        uint256 marketId, 
        address user, 
        uint16 pageIndex
    ) external view returns(uint256[] memory sellIdGroup) {
        uint256 len;
        uint256 currentId;
        address market = _getMarket(marketId);
        uint256 sellIdsLength = ISimpleMarketCore(market).getUserSellIdsLength(user);
        require(pageIndex <= sellIdsLength / 10, "Page index overflow");
        if(sellIdsLength >0 ){
            if(sellIdsLength <= 10){
                len = sellIdsLength;
            }else {
                if(sellIdsLength % 10 == 0){
                    len = 10;
                }else {
                    len = sellIdsLength % 10;
                }
                if(pageIndex >0 ){
                    currentId = pageIndex* 10;
                }
            }
        }
        sellIdGroup = new uint256[](len);
        unchecked {
            for(uint256 i; i<len; i++){
                sellIdGroup[i] = currentId;
                currentId++;
            }
        }
    }

    /**
     * @notice  .
     * @dev     .Obtain the current status of the order
     * @param   marketId  .
     * @param   orderId  .
     */
    function getOrderState(
        uint256 marketId, 
        uint256 orderId
    ) public view returns(OrderCurrentState state) {
        ISimpleMarketCore.OrderInfo memory newOrderInfo = getOrderInfo(marketId, orderId);
        uint256 endTime = _getEndTime(marketId); 
        if(endTime == 0 || block.timestamp <= endTime){
            if(
                newOrderInfo.state == ISimpleMarketCore.OrderState.buying || 
                newOrderInfo.state == ISimpleMarketCore.OrderState.selling
            ){
                state = OrderCurrentState.trading;
            }else if(newOrderInfo.state == ISimpleMarketCore.OrderState.found){
                state = OrderCurrentState.found;
            }else if(newOrderInfo.state == ISimpleMarketCore.OrderState.done){
                state = OrderCurrentState.done;
            }
            else{
                state = OrderCurrentState.inexistence;
            }
        }else{
            if(
                newOrderInfo.state == ISimpleMarketCore.OrderState.buying || 
                newOrderInfo.state == ISimpleMarketCore.OrderState.selling
            ){
                state = OrderCurrentState.refund;
            }else if(
                newOrderInfo.state == ISimpleMarketCore.OrderState.found
            ){
                state = OrderCurrentState.absenteeism;
            }else if(
                newOrderInfo.state == ISimpleMarketCore.OrderState.done
            ){
                state = OrderCurrentState.done;
            }else {
                state = OrderCurrentState.inexistence;
            }
        }
    }
    
    /**
     * @notice  .
     * @dev     .
     * @param   token  .
     */
    function getTokenDecimals(address token) public view returns(uint8) {
        return IERC20Metadata(token).decimals();
    }

    /**
     * @notice  .
     * @dev     .
     * @param   token  .
     * @param   user  .
     */
    function getUserTokenBalance(address token, address user) public view returns(uint256) {
        return IERC20(token).balanceOf(user);
    }

    /**
     * @notice  .
     * @dev     .
     * @param   marketId  .
     * @param   total  .
     */
    function getFee(
        uint256 marketId,
        uint256 total
    ) public view returns(uint256 _thisFee){
        address collateral = IGovernance(governance).getMarketConfig(marketId).collateral;
        uint8 decimals = getTokenDecimals(collateral);
        _thisFee = SimpleLibrary._fee(
            total,
            decimals
        );
    }

    function _getMarket(uint256 marketId) private view returns(address) {
        return ISimpleFactory(simpleFactory).getMarketInfo(marketId).market;
    }

    function _getEndTime(uint256 marketId) private view returns(uint256) {
        return IGovernance(governance).getMarketConfig(marketId).endTime;
    }

    function _tokenDecimals(address token) private view returns(uint8) {
        return IERC20Metadata(token).decimals();
    }

    function _getMarketConfig(uint256 _marketId) private view returns(IGovernance.MarketConfig memory) {
        return IGovernance(governance).getMarketConfig(_marketId);
    }

    function _getCurrentTotalCollateral(uint64 _price , uint64 _amount) private pure returns(uint256 _totalCollateral) {
        _totalCollateral = SimpleLibrary._getTotalCollateral(
            _price,
            _amount
        );
    }

    function _getCurrentTotalTargetAmount(uint256 _marketId, uint64 _price , uint64 _amount) private view returns(uint256 _totalTargetAmount) {
        address targetToken  =  _getMarketConfig(_marketId).waitToken;
        address collateral =  _getMarketConfig(_marketId).collateral;
        uint8 targetTokenDecimals = _tokenDecimals(targetToken);
        uint8 collateralDecimals = _tokenDecimals(collateral);
        _totalTargetAmount = SimpleLibrary._getTargetTokenAmount(
            targetTokenDecimals,
            collateralDecimals,
            _price,
            _amount
        );
    }

}