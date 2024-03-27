import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {

  const httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/monitoring.qpart.com.ua/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/monitoring.qpart.com.ua/cert.pem'),
  };

  const app = await NestFactory.create(AppModule, {httpsOptions});
  app.enableCors({
    origin: ["*","http://localhost:3000", "https://teplo-na-peredovu.netlify.app", "https://teplo-jade.vercel.app"],
    methods: "*",
    allowedHeaders: "*",
  });

  await app.listen(443, () => {
    console.log('Nest application is listening on port 443');
  });

  console.log(`Application is running on: ${await app.getUrl()}`);

}
bootstrap();