// src/config/config.init.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { HashService } from '../auth/hash.service'; // Добавьте импорт

@Injectable()
export class ConfigInitializer {
  private readonly logger = new Logger(ConfigInitializer.name);
  private readonly configPath = path.join(process.cwd(), 'config.json');

  constructor(private readonly hashService: HashService) {}

  async initializeConfig() {
    try {
      await this.ensureConfigExists();
      this.logger.log('Configuration initialized successfully');
    } catch (error) {
      this.logger.error(
        'Failed to initialize config:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  private async ensureConfigExists() {
    try {
      await fs.access(this.configPath);
      this.logger.log(`Config file found at ${this.configPath}`);
    } catch {
      await this.createDefaultConfig();
    }
  }

  async createDefaultConfig() {
    const defaultConfig = {
      passwordHash: this.hashService.hashPassword('12345'), // Теперь hashService доступен
      createdAt: new Date().toISOString(),
      updatedAt: null,
      previousHashes: [],
    };

    await fs.writeFile(
      this.configPath,
      JSON.stringify(defaultConfig, null, 2),
      { mode: 0o600 },
    );

    this.logger.warn('Default password 12345 was created. Please change it!');
  }
}
