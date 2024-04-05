import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/monitoring.qpart.com.ua/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/monitoring.qpart.com.ua/fullchain.pem'),
  };

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
  
  // websocket server
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.enableCors(corsOptions)

  await app.listen(5000);
}
bootstrap();
