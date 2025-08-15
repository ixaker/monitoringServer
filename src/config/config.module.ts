// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigInitializer } from './config.init';
import { HashModule } from '../auth/hash.module';

@Module({
  imports: [HashModule],
  providers: [ConfigService, ConfigInitializer],
  exports: [ConfigService], // Важно: экспортируем сервис
})
export class ConfigModule {}
