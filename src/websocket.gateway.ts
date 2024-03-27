import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway(80, { 
        transports: ['websocket', 'polling', 'long polling'], 
        path: '/socket.io',
        cors: {
            origin: ['*', 'http://localhost:3000']
        }
    })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

//   private logger = new Logger('WebsocketGateway');

  handleConnection(client: Socket) {
    console.log('Connection attempt from:', client.handshake.headers);
    console.log('conection')
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  handleError(error: Error) {
    console.error('WebSocket connection error:', error.message);
  }


}
