import { Injectable } from '@nestjs/common';
import { SocketService } from './websocket/websocket.service';

@Injectable()
export class AppService {
  constructor(private readonly SocketService: SocketService) { }
  getHello(): string {
    return 'Hello World!';
  }

  handlePushEvent(payload: any) {
    console.log('Handling push event:', payload);
    const command = { topic: 'command', payload: 'git pull' };
    this.SocketService.broadcastCommandToAllClients(command);
  }
}
