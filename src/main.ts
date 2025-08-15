import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(
      '/etc/letsencrypt/live/monitoring.qpart.com.ua/privkey.pem',
    ),
    cert: fs.readFileSync(
      '/etc/letsencrypt/live/monitoring.qpart.com.ua/fullchain.pem',
    ),
  };

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'qwerty'],
    credentials: true,
  };

  dotenv.config();
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.enableCors(corsOptions);

  await app.listen(5000);
}
bootstrap();
