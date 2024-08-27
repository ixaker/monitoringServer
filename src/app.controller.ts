import { Controller, Get, Post, Body, Headers, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { SocketService } from './websocket/websocket.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('webhook/push/git')
  handleGitPushWebhook(
    @Body() payload: any,
    @Headers('x-github-event') event: string,
    @Res() res: Response,
  ) {
    if (event === 'push') {
      console.log('Push event received:', payload);
      this.appService.handlePushEvent(payload);
    }
    res.status(200).send('OK');
  }
}

