// src/auth/hash.module.ts
import { Module } from '@nestjs/common';
import { HashService } from './hash.service';

@Module({
  providers: [HashService],
  exports: [HashService], // Важно: экспортируем сервис
})
export class HashModule {}
