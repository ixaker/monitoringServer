import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  handlePushEvent(payload: any) {
    console.log('Handling push event:', payload);
    // Додайте обробку подій тут
  }
}
