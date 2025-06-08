import { Controller, Get, Query } from '@nestjs/common';
import { CollateralService } from './collateral.service';

@Controller({
  path: 'collateral',
  version: '1',
})
export class CollateralController {
  constructor(private readonly collateralService: CollateralService) { }

  @Get('/list')
  async getCollateralList(@Query() params: { page: number }) {
    const { page } = params;
    const result = await this.collateralService.getCollateralList(page);
    return result;
  }
}
