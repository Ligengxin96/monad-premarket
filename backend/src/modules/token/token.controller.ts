import { Controller, Get, Query } from '@nestjs/common';
import { TokenService } from './token.service';

@Controller({
  path: 'token',
  version: '1',
})
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
  ) { }

  @Get('/list')
  async getTokenList(@Query() params: { page: number }) {
    const { page } = params;
    const result = await this.tokenService.getTokenList(page);
    return result;
  }


  @Get('/info')
  async getTokenInfo(@Query() params: { marketId: number }) {
    const { marketId } = params;
    const marketInfo = await this.tokenService.getTokenInfo(marketId);
    return { marketInfo };
  }
}


