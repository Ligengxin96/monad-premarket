import { Injectable } from '@nestjs/common';
import CollateralEntity from 'src/entity/collateral.entity';
import { Repository, DataSource } from 'typeorm';

@Injectable()
export class CollateralService {
  private readonly collateralRepository: Repository<CollateralEntity>;
  constructor(
    private readonly dataSource: DataSource,
  ) {
    this.collateralRepository = this.dataSource.getRepository(CollateralEntity);
  }

  async getCollateralList(page: number) {
    const pageSize = 10;
    const [list, count] = await this.collateralRepository.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'DESC',
      },
    });
    return { list, count, page, pageSize };
  }
}
