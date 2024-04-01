import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/monitoring.qpart.com.ua/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/monitoring.qpart.com.ua/fullchain.pem'),
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  await app.listen(5000);
}
bootstrap();
