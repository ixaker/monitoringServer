// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    generateToken() {
        const payload = { role: 'admin' };
        const token = this.jwtService.sign(payload);

        return { access_token: token };
  }
}