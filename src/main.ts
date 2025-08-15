import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
// import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

interface MyCorsOptions {
  origin: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

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

  const corsOptions: MyCorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'qwerty'],
    credentials: true,
  };

  const app = await NestFactory.create(AppModule, {
    // httpsOptions,
  });

  app.enableCors(corsOptions);
  const port = process.env.DOTENV_LISTEN_PORT;
  const hostIp = process.env.DOTENV_HOST_IP;
  await app.listen(port, hostIp);
}
bootstrap();
