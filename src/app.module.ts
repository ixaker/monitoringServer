import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketService } from './websocket/websocket.service';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth.middleware';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [AuthModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService, SocketService, AuthMiddleware],
})
export class AppModule {}
