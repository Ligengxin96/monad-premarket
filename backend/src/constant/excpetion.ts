import { HttpException, HttpStatus } from '@nestjs/common';

export enum BizErrorCode {
  Success = 0,
  ValidateHashError = 1001,
  MarketEnd = 1002,
  OrderStatusError = 1003,
  OrderNotExist = 1404,
}

export type BizError = {
  code: BizErrorCode;
  message: string;
};

export const ErrorCodeMap = new Map<BizErrorCode, string>([
  [BizErrorCode.Success, 'OK'],
  [BizErrorCode.ValidateHashError, 'Validate hash error'],
  [BizErrorCode.MarketEnd, 'Market end'],
  [BizErrorCode.OrderStatusError, 'Order status error'],
  [BizErrorCode.OrderNotExist, 'Order not exist'],
]);

export class BizException extends HttpException {
  readonly code: BizErrorCode;
  readonly message: string;

  constructor(bizErrorCode: BizErrorCode, message?: string) {
    super(message || ErrorCodeMap.get(bizErrorCode), HttpStatus.OK);
    this.code = bizErrorCode;
    this.message = message || ErrorCodeMap.get(bizErrorCode);
  }
}
