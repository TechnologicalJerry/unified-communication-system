import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './health/health.controller';
import { env } from './config/env';

@Module({
  imports: [MongooseModule.forRoot(env.MONGODB_URI), UsersModule, AuthModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
