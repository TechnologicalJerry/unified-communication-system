import { env } from '@express-server/shared/src/config/env';
import { logger } from '@express-server/shared/src/config/logger';
import app from './index';
import http from 'http';

async function bootstrap() {
  const port = env.PORT || 3000;

  const server = http.createServer(app);

  server.listen(port, () => {
    logger.info(`API Gateway listening on port ${port}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  logger.error('Failed to bootstrap api-gateway', {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});
