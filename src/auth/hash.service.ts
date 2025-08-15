import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HashService {
  hashPassword(password: string): string {
    return crypto
      .createHash('sha256')
      .update(password.trim().normalize('NFKC'), 'utf8')
      .digest('hex')
      .toLowerCase();
  }
}
