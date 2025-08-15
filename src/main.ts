import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  // const port = process.D
  // const httpsOptions = {
  //   key: fs.readFileSync(
  //     '/etc/letsencrypt/live/monitoring.qpart.com.ua/privkey.pem',
  //   ),
  //   cert: fs.readFileSync(
  //     '/etc/letsencrypt/live/monitoring.qpart.com.ua/fullchain.pem',
  //   ),
  // };

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'qwerty'],
    credentials: true,
  };

  dotenv.config();
  const app = await NestFactory.create(AppModule, {
    // httpsOptions,
  });

  app.enableCors(corsOptions);

  await app.listen(3000);
}
bootstrap();
