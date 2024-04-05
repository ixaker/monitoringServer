import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SocketService } from './websocket/websocket.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    
  ],
  controllers: [AppController],
  providers: [AppService, SocketService],
})
export class AppModule {}
