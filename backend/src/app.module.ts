import assert from 'assert';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisService } from './service/redis';
import { RawBodyMiddleware, JsonBodyMiddleware } from './middleware';
import { TokenModule } from './modules/token/token.module';
import { CollateralModule } from './modules/collateral/collateral.module';
import { OrderModule } from './modules/order/order.module';
import { TradeModule } from './modules/trade/trade.module';


const MySqlModule = TypeOrmModule.forRootAsync({
  useFactory: (
    configService: ConfigService
  ) => {
    const mysqlUrl = configService.get<string>('DB_MASTER_URL');
    assert.ok(mysqlUrl, 'env variable DB_MASTER_URL is not defined');
    return {
      type: 'mysql',
      charset: 'utf8mb4',
      url: mysqlUrl,
      synchronize: true,
      logging: true,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      retryAttempts: 3,
      retryDelay: 3000,
    };
  },
  imports: [ConfigModule],
  inject: [ConfigService]
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    MySqlModule,
    TokenModule,
    CollateralModule,
    OrderModule,
    TradeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RedisService
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    const middlewares: any[] = [RawBodyMiddleware, JsonBodyMiddleware];
    consumer.apply(...middlewares).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
