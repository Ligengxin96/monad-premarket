import { Module } from '@nestjs/common';
import { RedisService } from 'src/service/redis';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';

@Module({
  imports: [],
  controllers: [TokenController],
  providers: [RedisService, TokenService],
  exports: [TokenService],
})
export class TokenModule { }
