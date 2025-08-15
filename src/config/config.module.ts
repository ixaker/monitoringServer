// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { HashModule } from '../auth/hash.module.js';
import { ConfigInitializer } from './config.init.js';
import { ConfigService } from './config.service.js';

@Module({
  imports: [HashModule],
  providers: [ConfigService, ConfigInitializer],
  exports: [ConfigService], // Важно: экспортируем сервис
})
export class ConfigModule {}
