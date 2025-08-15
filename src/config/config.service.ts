// src/config/config.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
// import * as crypto from 'crypto';
import { PasswordValidator } from '../auth/password.validator';
import { HashService } from '../auth/hash.service';
import { ConfigInitializer } from './config.init';

interface AppConfig {
  passwordHash: string;
  createdAt: string;
  updatedAt?: string;
  previousHashes?: string[];
}

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly configPath = path.join(process.cwd(), 'config.json');
  private config: AppConfig;
  private previousHashes: string[] = [];
  constructor(
    private readonly hashService: HashService,
    private readonly configInitializer: ConfigInitializer,
  ) {}

  async onModuleInit() {
    await this.initializeConfig();
  }

  private async initializeConfig() {
    try {
      await this.loadConfig();
    } catch (error) {
      console.log('Creating default config...');
      await this.configInitializer.createDefaultConfig();
    }
  }

  async reloadConfig() {
    await this.loadConfig();
  }

  private async loadConfig() {
    const data = await fs.readFile(this.configPath, 'utf-8');
    const parsed = JSON.parse(data);

    // Сохраняем все поля конфига, включая previousHashes
    this.config = {
      passwordHash: parsed.passwordHash,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
      previousHashes: parsed.previousHashes || [], // Добавляем previousHashes в config
    };

    this.previousHashes = parsed.previousHashes || [];

    console.log('Config loaded:', {
      config: this.config,
      previousHashes: this.previousHashes,
    });
  }

  private async saveConfig() {
    // Сохраняем историю в файл
    const fullConfig = {
      passwordHash: this.config.passwordHash,
      createdAt: this.config.createdAt,
      updatedAt: this.config.updatedAt,
      previousHashes: this.previousHashes, // Сохраняем историю
    };

    await fs.writeFile(this.configPath, JSON.stringify(fullConfig, null, 2));
    console.log('Config saved:', fullConfig); // Добавьте для отладки
  }

  // private hashPassword(password: string): string {
  //   // Явное приведение и нормализация
  //   const normalizedPassword = String(password).trim().normalize('NFKC'); // Учитывает Unicode-вариации

  //   return crypto
  //     .createHash('sha256')
  //     .update(normalizedPassword, 'utf8')
  //     .digest('hex')
  //     .toLowerCase(); // Единый регистр
  // }

  async validatePassword(password: string): Promise<boolean> {
    // Принудительно загружаем актуальный конфиг
    await this.reloadConfig();

    const inputHash = this.hashService.hashPassword(password);
    const currentHash = this.config.passwordHash;

    console.log('Password validation:', {
      input: password,
      inputHash,
      currentHash,
      match: inputHash === currentHash,
    });

    // Блокировка дефолтного пароля
    if (password === '12345') {
      return currentHash === this.hashService.hashPassword('12345');
    }

    return inputHash === currentHash;
  }

  async updatePassword(
    newPassword: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      //  Загружаем актуальный конфиг
      await this.reloadConfig();
      const newHash = this.hashService.hashPassword(newPassword);

      //  Валидация пароля
      const validationError = PasswordValidator.validate(newPassword);
      if (validationError) {
        console.log('Password validation failed:', validationError);
        return {
          success: false,
          message: validationError,
        };
      }

      console.log('Update attempt:', {
        currentHash: this.config.passwordHash,
        newHash,
        previousHashes: this.previousHashes,
      });

      //  Проверка на текущий пароль
      if (this.config.passwordHash === newHash) {
        console.log('Rejected: new password matches current');
        return {
          success: false,
          message: 'Новий пароль співпадає з поточним',
        };
      }

      //  Проверка истории - ДОЛЖНА СРАБОТАТЬ В ВАШЕМ СЛУЧАЕ
      if (this.previousHashes.includes(newHash)) {
        console.log('Rejected: password found in history');
        // Явно возвращаем результат и завершаем функцию
        return {
          success: false,
          message: 'Пароль використовувався раніше',
        };
      }

      //  Обновляем историю (кроме дефолтного пароля)
      if (this.config.passwordHash !== this.hashService.hashPassword('12345')) {
        this.previousHashes = [
          ...new Set([...this.previousHashes, this.config.passwordHash]),
        ].slice(-3);
        console.log('Updated previousHashes:', this.previousHashes);
      }

      //  Обновляем конфиг
      this.config = {
        passwordHash: newHash,
        createdAt: this.config.createdAt,
        updatedAt: new Date().toISOString(),
        previousHashes: this.previousHashes,
      };

      //  Сохраняем конфиг
      await this.saveConfig();
      console.log('Config saved successfully');

      //  Проверка целостности
      await this.reloadConfig();
      if (this.config.passwordHash !== newHash) {
        console.error('Verification failed!');
        return {
          success: false,
          message: 'Ошибка сохранения пароля',
        };
      }

      console.log('Password changed successfully');
      return {
        success: true,
        message: 'Пароль успешно изменён',
      };
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return {
        success: false,
        message: 'Ошибка при изменении пароля',
      };
    }
  }
}
