import { OnGatewayConnection, WebSocketGateway, SubscribeMessage, WebSocketServer  } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Devices } from './../devices/devices';

@WebSocketGateway({ cors: { origin: '*' }})

export class SocketService implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  dev = new Devices(this.sendInfoForWebClient.bind(this));


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

    this.server.emit(payload.id, {topic: 'command', payload: payload.command});
  }

  // from Devices 
  @SubscribeMessage('telegram')
  handleMessageTelegram(client: any, data: any): void {
    console.log('SubscribeMessage - telegram', data);
  }

  // from Devices 
  @SubscribeMessage('result')
  handleMessageResult(client: any, data: any): void {
      console.log('SubscribeMessage - result', data);

      this.server.emit('webclient', data);
  }

  // ???
  @SubscribeMessage('message')
  handleMessage(client: any, data: any): void {
    console.log('Message received:',  data);
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

    console.log('Client disconnected', client.id, client.handshake.headers, devID);
  }

  sendInfoForWebClient(payload) {
    console.log('Send to WebClient'); 

    this.server.emit('webclient', payload);
  }
}

