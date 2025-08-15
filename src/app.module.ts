import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthMiddleware } from './auth.middleware.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from './config/config.module.js';
import { SocketService } from './websocket/websocket.service.js';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService, SocketService, AuthMiddleware],
})
export class AppModule {}
