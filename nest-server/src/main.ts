import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';

import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { env } from './config/env';
import { logger } from './config/logger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });
  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(env.PORT);
  logger.info(`HTTP server listening on port ${env.PORT}`);
}

bootstrap().catch((error: unknown) => {
  logger.error('Failed to bootstrap server', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
