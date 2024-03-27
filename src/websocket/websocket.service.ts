import { OnGatewayConnection, WebSocketGateway, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class SocketService implements OnGatewayConnection{
  @WebSocketServer()
  server: Server;
  
  clientList(payload) {
    this.server.sockets.sockets.forEach((client, id) => {
      console.log(id)
      console.log(client.handshake.headers)
      
      console.log(client.handshake.headers.type);
      
      if (client.handshake.headers.type === 'webclient') {
        client.send(payload)
      }
    })
  }
  
  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected');
    console.log('Session ID:', client.id);
    console.log('Headers:', client.handshake.headers);
    console.log('Type:', client.handshake.headers.type || 'no type');
    console.log('webSocketServer:', );
  }

  

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    console.log('Message received:', payload);
    this.clientList(payload);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected');
    console.log(client.id);
  }
}

