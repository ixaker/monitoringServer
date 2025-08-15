// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ConfigService } from 'src/config/config.service.js';

@Controller('login')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async login(@Body() body: any) {
    const { password } = body;
    // Перевірка пароля
    if (!password) {
      console.log('Received password:', body.password);
      throw new HttpException(
        'Invalid password from authController',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isValid = await this.configService.validatePassword(password);

    if (!isValid) {
      console.log('Invalid login attempt with password:', body.password);
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Якщо пароль вірний, повертаємо токен або інші дані аутентифікації
    return this.authService.generateToken();
  }
}
