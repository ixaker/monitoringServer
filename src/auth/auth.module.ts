// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module.js';

@Module({
  imports: [
    ConfigModule, // Импортируем модуль конфигурации
    JwtModule.register({
      secret: 'secret_key_for_monitoring',
      signOptions: {}, // time token is valid infinity
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
