// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

library SimpleLibrary {
    function _getTotalCollateral(
        uint64 price,
        uint64 amount
    ) internal pure returns (uint256 totalCollateral) {
        totalCollateral = (price * amount) / (10 ** 6);
    }

    function _getTargetTokenAmount(
        uint8 _targetDecimals,
        uint8 _collateralDecimals,
        uint64 price,
        uint64 amount
    ) internal pure returns (uint256 targetTokenAmount) {
        if (_collateralDecimals > _targetDecimals && _targetDecimals != 0) {
            targetTokenAmount =
                (price * amount) /
                (10 ** 6) /
                10 ** (_collateralDecimals - _targetDecimals);
        } else if (
            _collateralDecimals < _targetDecimals && _targetDecimals != 0
        ) {
            targetTokenAmount =
                ((price * amount) / (10 ** 6)) *
                10 ** (_targetDecimals - _collateralDecimals);
        } else if (
            _collateralDecimals == _targetDecimals && _targetDecimals != 0
        ) {
            targetTokenAmount = (price * amount) / (10 ** 6);
        } else {}
    }

    function _fee(
        uint256 total,
        uint8 tokenDecimals
    ) internal pure returns (uint256 _thisFee) {
        if (
            total >= 10 * 10 ** tokenDecimals &&
            total < 1000 * 10 ** tokenDecimals
        ) {
            _thisFee = total / 100;
        } else if (
            total >= 1000 * 10 ** tokenDecimals &&
            total < 10000 * 10 ** tokenDecimals
        ) {
            _thisFee = (total / 1000) * 80;
        } else if (total >= 10000 * 10 ** tokenDecimals) {
            _thisFee = (total / 1000) * 50;
        } else {}
    }

}
