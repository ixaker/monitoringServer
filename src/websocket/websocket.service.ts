import { OnGatewayConnection, WebSocketGateway, SubscribeMessage, WebSocketServer  } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Devices } from './../devices/devices';
import { log } from 'console';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class SocketService implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // Создание экземпляра класса Devices
  dev = new Devices();

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected', client.id, client.handshake.headers.type || 'no type');

    if (client.handshake.headers.type === 'webclient') {
      const listDevices = this.dev.getList();

      listDevices.forEach((device) => {
        client.send(JSON.stringify({topic:'info', payload:device}));
      });
    }
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected', client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, data: any): void {
    const message = JSON.parse(data);
    const { topic, payload } = message;

    console.log('Message received:', topic, data.slice(0, 120) + '...');

    if(topic === 'info'){
      client.devID = payload.id;
      // save info to array
      payload.timeLastInfo = new Date();
      payload.online = true;

      this.dev.updateInfo(payload);

      // send info to web client
      this.sendInfoForWebClient(message);

    }else if (topic === 'command') {
      this.server.sockets.sockets.forEach((socket, id) => {
        const devID = socket['devID'] || '';

        if (devID === payload.id) {
          console.log('Send command to client', payload);
          
          socket.send(JSON.stringify({topic: 'command', payload: payload.command}));
        }
      })

    }else if (topic === 'result') {
      // send info to web client
      this.sendInfoForWebClient(message);
      
    }else{
      console.error('unknown topic', topic); 
    }
  }

  sendInfoForWebClient(payload) {
    this.server.sockets.sockets.forEach((client, id) => {
      if (client.handshake.headers.type === 'webclient') {
        client.send(JSON.stringify(payload));
      }
    })
  }
}

