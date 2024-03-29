import { OnGatewayConnection, WebSocketGateway, SubscribeMessage, WebSocketServer  } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Devices } from './../devices/devices';

@WebSocketGateway({ cors: { origin: '*' }})

export class SocketService implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  dev = new Devices(this.sendInfoForWebClient.bind(this));

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected', client.id, client.handshake.headers.type || 'no type');

    if (client.handshake.headers.type === 'webclient') {
      const listDevices = this.dev.getList();

      listDevices.forEach((device) => {
        client.emit('webclient', JSON.stringify({topic:'info', payload:device}));
      });
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, data: any): void {
    const message = JSON.parse(data);
    const { topic, payload } = message;

    console.log('Message received:', topic, data.slice(0, 120) + '...');

    if(topic === 'info'){
      client.devID = payload.id;
      this.dev.updateInfo(payload);

    }else if (topic === 'command') {
      this.server.sockets.sockets.forEach((socket, id) => {
        const devID = socket['devID'] || '';

        if (devID === payload.id) {
          console.log('Send command to client', payload);
          socket.send(JSON.stringify({topic: 'command', payload: payload.command}));
        }
      })

    }else if (topic === 'result') {
      this.sendInfoForWebClient(message);
      
    }else{
      console.error('unknown topic', topic); 
    }
  }

  sendInfoForWebClient(payload) {
    const message = JSON.stringify(payload)
    console.log('Send to WebClient', message.slice(0, 120) + '...');
    
    this.server.emit('webclient', message);
  }

  handleDisconnect(client: any) {
    const devID = client.devID || '';

    if (devID !== '') {
      this.dev.setOffline(devID);
    }

    console.log('Client disconnected', client.id, client.handshake.headers, devID);
  }
}

