// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import {IGovernance} from "../interfaces/IGovernance.sol";
import {ISimpleMarketCore} from "../interfaces/ISimpleMarketCore.sol";
import {SimpleLibrary} from "../libraries/SimpleLibrary.sol";

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SimpleMarketCore is ReentrancyGuard, ISimpleMarketCore {
    using SafeERC20 for IERC20;

    uint256 public currentMarketId;
    uint256 public orderId;

    bytes1 private immutable ZEROBYTES1;
    bytes1 private immutable ONEBYTES1 = 0x01;
    address public governance;

    constructor(address _governance, uint256 _marketId) {
        governance = _governance;
        currentMarketId = _marketId;
    }

    mapping(uint256 => OrderInfo) private orderInfo;
    mapping(address => UserInfo) private userInfo;

    /**
     * @notice  .It can only be created 12 hours before the market ends,
     * and the total amount must be greater than or equal to 10$
     * @dev     .Users create orders (buy or sell)
     * @param   _orderType  .Order type
     * @param   _amount  . The quantity you want to buy or sell(Collateral decimals)
     * @param   _price  .The price for purchase or sale(/ 10 ** 6)
     */

    function createOrder(
        OrderType _orderType,
        uint64 _amount,
        uint64 _price
    ) external nonReentrant {
        _checkValidTime();
        if (_orderType == OrderType.buy) {
            orderInfo[orderId].state = OrderState.buying;
            userInfo[msg.sender].buyIdGroup.push(orderId);
        } else {
            orderInfo[orderId].state  = OrderState.selling;
            userInfo[msg.sender].sellIdGroup.push(orderId);
        }
        address collateral = _getMarketConfig().collateral;
        address targetToken = _getMarketConfig().waitToken;
        uint8 collateralDecimals = _tokenDecimals(collateral);
        uint8 targetTokenDecimals = _tokenDecimals(targetToken);
        uint256 totalCollateralAmount = SimpleLibrary._getTotalCollateral(
            _price,
            _amount
        );
        uint256 totalTargetTokenAmount = SimpleLibrary._getTargetTokenAmount(
            targetTokenDecimals,
            collateralDecimals,
            _price,
            _amount
        );
        require(
            totalCollateralAmount >= 10 * 10 ** collateralDecimals,
            "The total collateral must be greater than or equal to 10$"
        );
        IERC20(collateral).safeTransferFrom(
            msg.sender,
            address(this),
            totalCollateralAmount
        );
        orderInfo[orderId].orderType = _orderType;
        orderInfo[orderId].targetTokenAmount = totalTargetTokenAmount;
        orderInfo[orderId].collateralAmount = totalCollateralAmount;
        orderInfo[orderId].price = _price;
        orderInfo[orderId].creator = msg.sender;
        emit CreateOrder(orderId, msg.sender, totalTargetTokenAmount);
        orderId++;
        _join();
    }

    function matchOrder(
        OrderType _orderType,
        uint256 _id
    ) external nonReentrant {
        _checkValidTime();
        uint256 totalFee;
        uint256 collateralTokenAmount = orderInfo[_id].collateralAmount;
        address collateral = _getMarketConfig().collateral;
        address creator = orderInfo[_id].creator;
        if (msg.sender != creator) {
                if (_orderType == OrderType.buy && orderInfo[_id].state == OrderState.selling) {
                    userInfo[msg.sender].sellIdGroup.push(_id);
                    totalFee += SimpleLibrary._fee(
                        collateralTokenAmount,
                        _tokenDecimals(collateral)
                    );
                } else if (_orderType == OrderType.sell && orderInfo[_id].state == OrderState.buying){
                    userInfo[msg.sender].buyIdGroup.push(_id);
                } else {
                    revert InvalidState("Invalid order");
                }
                orderInfo[_id].state = OrderState.found;
                orderInfo[_id].trader = msg.sender;
                IERC20(collateral).safeTransferFrom(
                    msg.sender,
                    address(this),
                    collateralTokenAmount
                );
                if (totalFee > 0 ) {
                    _safeTransferFee(collateral, totalFee);
                }
        } else {
            revert InvalidUser();
        }
        _join();
        emit MatchOrder(_id);
    }

    function cancel(uint256 _id) external nonReentrant {
        _checkValidTime();
        address creator = orderInfo[_id].creator;
        if(msg.sender == creator){
            if(orderInfo[_id].state == OrderState.buying || orderInfo[_id].state == OrderState.selling) {
                uint256 collateralTokenAmount = orderInfo[_id].collateralAmount;
                address collateral = _getMarketConfig().collateral;
                orderInfo[_id].state = OrderState.fail;
                uint256 fee = collateralTokenAmount * 5 / 1000;
                IERC20(collateral).safeTransfer(creator, collateralTokenAmount - fee);
                _safeTransferFee(collateral, fee);
                emit CancelOrder(_id);
            }else {
                revert InvalidState("Invalid order");
            }
        }else {
            revert InvalidUser();
        }
    }

    function depoiste(uint256 _id) external nonReentrant {
        uint256 endTime = _getMarketConfig().endTime;
        address targetToken = _getMarketConfig().waitToken;
        require(targetToken != address(0), "targetToken");
        require(endTime != 0 && block.timestamp < _getMarketConfig().endTime, "Invalid time");
        if(orderInfo[_id].state == OrderState.found) {
            uint256 targetTokenAmount = orderInfo[_id].targetTokenAmount; 
            if(msg.sender == orderInfo[_id].creator || msg.sender == orderInfo[_id].trader) {
                IERC20(targetToken).safeTransferFrom(msg.sender, address(this), targetTokenAmount);
                orderInfo[_id].state = OrderState.done;
                emit DepositeOrder(_id);
            }else {
                revert InvalidUser();
            }
        }else{
            revert InvalidState("Invalid order");
        }
    }

    function refund(uint256 _id) external nonReentrant {
        _checkFinalTime();
        address creator = orderInfo[_id].creator;
        if(msg.sender == creator){
            if(orderInfo[_id].state == OrderState.buying || orderInfo[_id].state == OrderState.selling) {
                uint256 collateralTokenAmount = orderInfo[_id].collateralAmount;
                address collateral = _getMarketConfig().collateral;
                orderInfo[_id].state = OrderState.fail;
                IERC20(collateral).safeTransfer(creator, collateralTokenAmount);
                emit CancelOrder(_id);
            }else {
                revert InvalidState("Invalid order");
            }
        }else {
            revert InvalidUser();
        }
    }

    function withdraw(OrderType _orderType, uint256 _id) external nonReentrant {
        _checkFinalTime();
        address targetToken = _getMarketConfig().waitToken;
        address collateral = _getMarketConfig().collateral;
        uint8 tokenDecimals = _tokenDecimals(collateral);
        uint256 totalFee;
        uint256 targetTokenAmount;
        uint256 collateralTokenAmount;
        if(msg.sender == orderInfo[_id].creator){
            if(
                _orderType == OrderType.buy && 
                orderInfo[_id].orderType == _orderType && 
                orderInfo[_id].state == OrderState.done
            ){
                if(orderInfo[_id].creatorWithdrawState == ZEROBYTES1){
                    targetTokenAmount += orderInfo[_id].targetTokenAmount;
                    orderInfo[_id].creatorWithdrawState = ONEBYTES1;
                }
            } else if(
                _orderType == OrderType.sell && 
                orderInfo[_id].orderType == _orderType && 
                orderInfo[_id].state == OrderState.done
            ){
                if(orderInfo[_id].creatorWithdrawState == ZEROBYTES1){
                    collateralTokenAmount += orderInfo[_id].collateralAmount;
                    orderInfo[_id].creatorWithdrawState = ONEBYTES1;
                }
            }
        }else if (msg.sender == orderInfo[_id].trader){
            if(
                _orderType == OrderType.buy && 
                orderInfo[_id].orderType == OrderType.sell && 
                orderInfo[_id].state == OrderState.done
            ){
                if(orderInfo[_id].traderWithdrawState == ZEROBYTES1){
                    targetTokenAmount += orderInfo[_id].targetTokenAmount;
                    orderInfo[_id].traderWithdrawState = ONEBYTES1;
                }
            } else if(
                    _orderType == OrderType.sell && 
                    orderInfo[_id].orderType == OrderType.buy && 
                    orderInfo[_id].state == OrderState.done
            ){
                if(orderInfo[_id].traderWithdrawState == ZEROBYTES1){
                    collateralTokenAmount += orderInfo[_id].collateralAmount;
                    orderInfo[_id].traderWithdrawState = ONEBYTES1;
                }
            }
        }else {
            revert InvalidUser();
        }
       
        if(targetTokenAmount > 0) {
            IERC20(targetToken).safeTransfer(msg.sender, targetTokenAmount);
        }
        // sell pay fee
        if(collateralTokenAmount > 0) {
            totalFee += SimpleLibrary._fee(collateralTokenAmount, tokenDecimals);
            IERC20(collateral).safeTransfer(msg.sender, collateralTokenAmount * 2 - totalFee);
            _safeTransferFee(collateral, totalFee);
        }
        emit WithdrawOrder(_id, _orderType);
    }

    function withdrawLiquidatedDamages(uint256 _id) external {
        _checkFinalTime();
        address collateral = _getMarketConfig().collateral;
        uint8 tokenDecimals = _tokenDecimals(collateral);
        uint256 totalFee;
        uint256 collateralTokenAmount;
        if(msg.sender == orderInfo[_id].creator){
            if(orderInfo[_id].state == OrderState.found){
                if(orderInfo[_id].orderType == OrderType.buy){
                    if(orderInfo[_id].creatorWithdrawState == ZEROBYTES1){
                        collateralTokenAmount += orderInfo[_id].collateralAmount;
                        orderInfo[_id].creatorWithdrawState = ONEBYTES1; 
                    }else {
                        revert InvalidState("Invalid order");
                    }
                }
            }
        }else if(msg.sender == orderInfo[_id].trader){
            if(orderInfo[_id].state == OrderState.found){
                if(orderInfo[_id].orderType == OrderType.sell){
                    if(orderInfo[_id].traderWithdrawState == ZEROBYTES1){
                        collateralTokenAmount += orderInfo[_id].collateralAmount;
                        orderInfo[_id].traderWithdrawState = ONEBYTES1;
                    }else {
                        revert InvalidState("Invalid order");
                    }
                }
            }
        }else{
            revert InvalidUser();
        }
        if(collateralTokenAmount > 0){
            totalFee += SimpleLibrary._fee(collateralTokenAmount, tokenDecimals);
            IERC20(collateral).safeTransfer(msg.sender, collateralTokenAmount * 2 - totalFee);
            emit WithdrawLiquidatedDamage(_id);
        }
    }

    function _safeTransferFee(address _collateral, uint256 _totalFee) internal {
        IGovernance.FeeInfo memory newFeeInfo = IGovernance(governance).getFeeInfo();
        IERC20(_collateral).safeTransfer(newFeeInfo.feeReceiver, _totalFee);
    }

    function _join() private {
        IGovernance(governance).join(msg.sender, currentMarketId);
    }

    function _checkValidTime() private view {
        uint256 endTime = _getMarketConfig().endTime;
        require(endTime == 0 || block.timestamp < endTime - 12 hours, "Invalid time");
    }

    function _checkFinalTime() private view {
        uint256 endTime = _getMarketConfig().endTime;
        require(endTime !=0 && block.timestamp > endTime + 12 hours, "Invalid time");
    }

    function _getMarketConfig()
        internal
        view
        returns (IGovernance.MarketConfig memory _marketConfig)
    {
        _marketConfig = IGovernance(governance).getMarketConfig(currentMarketId);
    }

    function _tokenDecimals(
        address _token
    ) internal view returns (uint8 _thisDecimals) {
        if (_token == address(0)) {
            _thisDecimals = 0;
        } else {
            _thisDecimals = IERC20Metadata(_token).decimals();
        }
    }

    function getOrderInfo(uint256 thisOrderId) external view returns(OrderInfo memory) {
        return orderInfo[thisOrderId];
    }

    function indexUserBuyId(address user, uint256 index) external view returns(uint256 buyId) {
        buyId = userInfo[user].buyIdGroup[index];
    }

    function indexUserSellId(address user, uint256 index) external view returns(uint256 sellId) {
        sellId = userInfo[user].sellIdGroup[index];
    }

    function getUserBuyIdsLength(address user) external view returns(uint256) {
        return userInfo[user].buyIdGroup.length;
    }

    function getUserSellIdsLength(address user) external view returns(uint256) {
        return userInfo[user].sellIdGroup.length;
    }
}
