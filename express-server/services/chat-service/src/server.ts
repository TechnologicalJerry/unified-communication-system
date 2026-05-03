import http from 'http';
import { env } from '@express-server/shared/src/config/env';
import { logger } from '@express-server/shared/src/config/logger';
import app from './index';

async function bootstrap() {
  const port = env.PORT ? Number(env.PORT) + 2 : 3002;

  const server = http.createServer(app);

  server.listen(port, () => {
    logger.info(`Chat service listening on port ${port}`);
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
  logger.error('Failed to bootstrap chat service', {
    error: error instanceof Error ? error.message : String(error)
  });
  process.exit(1);
});
