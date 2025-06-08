import { Injectable } from '@nestjs/common';
import TokenEntity from 'src/entity/token.entity';
import { DataSource, Repository } from 'typeorm';


@Injectable()
export class TokenService {
  private readonly tokenRepository: Repository<TokenEntity>;
  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.tokenRepository = this.dataSource.getRepository(TokenEntity);
  }

  async getTokenList(page: number) {
    const pageSize = 10;
    const [list, count] = await this.tokenRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'DESC',
      },
    });

    return { list, count, page, pageSize };
  }

  async getTokenInfo(marketId: number) {
    const marketInfo = await this.tokenRepository.findOne({ where: { marketId } });
    return marketInfo;
  }
}
