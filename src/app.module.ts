import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketService } from './websocket/websocket.service';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './auth.middleware';
import { TokenService } from './tokens/tokens';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, SocketService, AuthMiddleware],
})
export class AppModule {}
