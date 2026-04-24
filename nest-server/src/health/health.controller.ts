import { Controller, Get } from '@nestjs/common';

import { env } from '../config/env';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  }
}
