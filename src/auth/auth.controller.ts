// auth.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { config } from './../../config';

@Controller('login')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() body: any) {
    const { password } = body;
    console.log('password from client', password);

    // Перевірка пароля
    if (password !== config.password) {
      throw new HttpException('Invalid password from authController', HttpStatus.UNAUTHORIZED);
    }

    // Якщо пароль вірний, повертаємо токен або інші дані аутентифікації
    return this.authService.generateToken();
  }
}