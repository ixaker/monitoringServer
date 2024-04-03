import { OnGatewayConnection, WebSocketGateway, SubscribeMessage, WebSocketServer  } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Devices } from './../devices/devices';
import * as TelegramBot from 'node-telegram-bot-api';

@WebSocketGateway({ cors: { origin: '*' }})

export class SocketService implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  dev = new Devices(this.sendInfoForWebClient.bind(this));
  bot = new TelegramBot('5732114057:AAHK-S0mlws8G4-d9AOwJ0rlqX6ikeI_nSY', { polling: true });
  chatId = '672754822';

  // from Devices
  @SubscribeMessage('info')
  handleMessageInfo(client: any, payload: any): void {
    console.log('SubscribeMessage - info', payload.name);
    
    client.devID = payload.id;
    this.dev.updateInfo(payload);
  }

  // from WebClients
  @SubscribeMessage('command')
  handleMessageCommand(client: any, payload: any): void {
    console.log('SubscribeMessage - command', payload);

    this.server.emit(payload.id, payload);
  }

  // from Devices 
  @SubscribeMessage('telegram')
  handleMessageTelegram(client: any, data: any): void {
    console.log('SubscribeMessage - telegram', data);

    this.bot.sendMessage(this.chatId, data);
  }

  // from Devices 
  @SubscribeMessage('result')
  handleMessageResult(client: any, data: any): void {
      console.log('SubscribeMessage - result', data);

      this.server.emit('webclient', data);
  }

  // from WebClients
  @SubscribeMessage('disable')
  handleMessageDisable(client: any, payload: any): void {
    console.log('SubscribeMessage - disable');

    this.dev.getList().forEach((device) => {
      if (device.online) {
        this.server.emit(device.id, {topic: 'command', payload: 'Stop-Computer -Force'});
      }
    });

    this.server.emit(payload.id, payload);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected', client.id, client.handshake.headers.type || 'no type');

    if (client.handshake.headers.type === 'webclient') {
      this.dev.getList().forEach((device) => {
        client.emit('webclient', {topic:'info', payload:device});
      });
    }
  }

  handleDisconnect(client: any) {
    const devID = client.devID || '';

    if (devID !== '') {
      this.dev.setOffline(devID);
    }

    console.log('Client disconnected', client.id, devID);
  }

  sendInfoForWebClient(payload) {
    console.log('Send to WebClient'); 

    this.server.emit('webclient', payload);
  }
}

