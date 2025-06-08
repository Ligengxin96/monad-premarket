import 'dotenv';
import { version } from '../package.json';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';
import { ENV } from './constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    bufferLogs: true,
    bodyParser: false,
    cors: true,
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const logger = new Logger('bootstrap');
  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    logger.log(`App is running on port ${port}`);
    logger.log(`ENV: ${ENV}, Version: ${version}`);
  });

  process.once('SIGTERM', async () => {
    logger.log('SIGTERM signal received, APP closing');
    await app.close();
    logger.log('SIGTERM signal received, APP closed');
  });

  process.once('SIGINT', async () => {
    logger.log('SIGINT signal received, APP closing');
    await app.close();
    logger.log('SIGINT signal received, APP closed');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception thrown', error);
  });
}

bootstrap();
