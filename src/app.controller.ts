import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Injectable} from '@nestjs/common';
import { UseGateway } from '@nestjs/websockets'
import { WebsocketGateway } from './websocket.gateway'; 

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Injectable()
@UseGateway(WebsocketGateway) 
export class MyService {
  
}
