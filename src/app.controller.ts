import { Controller, Get, Post, Body, Headers, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('webhook/push/git')
  handleGitPushWebhook(
    @Body() payload: any, // Це тіло запиту (payload)
    @Headers('x-github-event') event: string, // Заголовок, який містить тип події
    @Res() res: Response, // Використовується для відповіді
  ) {
    // Перевіряємо тип події
    if (event === 'push') {
      console.log('Push event received:', payload);
      // Можете додати обробку даних тут або передати їх у ваш сервіс
      this.appService.handlePushEvent(payload);
    }

    // Відповідь серверу GitHub
    res.status(200).send('OK');
  }
}

