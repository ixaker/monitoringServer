import {
  OnGatewayConnection,
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Devices } from './../devices/devices';
import * as TelegramBot from 'node-telegram-bot-api';
import { AuthService } from './../auth/auth.service';
import { performance } from 'perf_hooks';
import { ConfigService } from 'src/config/config.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketService implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  dev = new Devices(this.sendInfoForWebClient.bind(this));
  bot = new TelegramBot('5732114057:AAHK-S0mlws8G4-d9AOwJ0rlqX6ikeI_nSY', {
    polling: true,
  });
  chatId = '672754822';

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @SubscribeMessage('delete_device')
  handleDeleteDevice(client: any, payload: any): void {
    console.log('SubscribeMessage - delete_device', payload);

    const deviceId = payload.deviceId;

    this.dev.removeDevice(deviceId);

    console.log(`Device ${deviceId} deleted and all clients notified.`);
  }

  // from Devices
  @SubscribeMessage('info')
  handleMessageInfo(client: any, payload: any): void {
    console.log('SubscribeMessage - info', payload.name);
    client.devID = payload.id;
    this.dev.updateInfo(payload);
  }

  @SubscribeMessage('update')
  handleUpdate(client: any, payload: any): void {
    console.log('Handling update event:', payload);
    const command = { topic: 'command', payload: payload.command };
    this.broadcastCommandToAllClients(command);
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
        this.server.emit(device.id, {
          topic: 'command',
          payload: 'Stop-Computer -Force',
        });
      }
    });

    this.server.emit(payload.id, payload);
  }

  // from WebClients
  @SubscribeMessage('getList')
  handleMessageGetList(client: any, payload: any): void {
    console.log('SubscribeMessage - getList');

    if (client.handshake.headers.type === 'webclient') {
      const clientToken = client.handshake.authorization;
      try {
        const decodedToken = this.authService.verifyToken(clientToken);
        console.log('client token is valid');

        // Вимірюємо час початку відправки даних
        const startTime = performance.now();

        // Отримуємо список пристроїв
        const devices = this.dev.getList();

        devices.forEach((device) => {
          const sendStartTime = performance.now();
          console.log(`Sending data for device ${device.id}`);

          client.emit('webclient', { topic: 'info', payload: device });
          const sendEndTime = performance.now();
          console.log(
            `Data for device ${device.id} sent in ${sendEndTime - sendStartTime}ms`,
          );
        });

        // Вимірюємо загальний час для відправки всіх даних
        const endTime = performance.now();
        console.log(
          `Total time to process getList request: ${endTime - startTime}ms`,
        );
      } catch (error) {
        console.log('Invalid token. Client unauthorized.');
        client.emit('unauthorized', {
          message: 'Unauthorized access',
          status: 401,
          reason: 'Invalid token',
        });
        // client.disconnect(false)
      }
    }
  }

  // from WebClients
  @SubscribeMessage('change_password')
  async handleChangePassword(client: Socket, payload: { newPassword: string }) {
    console.log('SubscribeMessage - change_password', payload.newPassword);
    try {
      // Проверка авторизации (если нужно)
      const token =
        client.handshake.headers.authorization || client.handshake.auth.token;
      if (!token) throw new Error('Требуется авторизация');

      // Валидация пароля
      if (payload.newPassword.length < 8) {
        throw new Error('Пароль должен содержать минимум 8 символов');
      }

      // Обновляем пароль в конфиге
      const result = await this.configService.updatePassword(
        payload.newPassword,
      );

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  handleDisconnect(client: any) {
    const devID = client.devID || '';

    if (devID !== '') {
      this.dev.setOffline(devID);
    }

    console.log('Client disconnected', client.id, devID);
  }

  handleConnection(client: Socket, ...args: any[]): void {
    console.log('Client connected', client.id);
    // Ви можете додати інші дії, які потрібно виконати при підключенні клієнта
  }

  sendInfoForWebClient(payload) {
    console.log('Send to WebClient');
    this.server.emit('webclient', payload);
  }

  broadcastCommandToAllClients(command: { topic: string; payload: string }) {
    this.server.emit('update', command);

    console.log(`Broadcast command: ${command.payload} to all clients`);
  }
}
