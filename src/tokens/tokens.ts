import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TokenService {
  //   private filePath = path.join(__dirname, './../../tokens.json');
  private filePath: string = 'tokens.json';

  readTokensFromFile(): string[] {
    console.log(this.filePath);
    try {
      const tokensData = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(tokensData);
    } catch (error) {
      console.error('Помилка при читанні файлу токенів:', error.message);
      return [];
    }
  }

  writeTokensToFile(token: string): void {
    try {
      const tokens: string[] = this.readTokensFromFile(); // Отримуємо поточні токени з файлу
      tokens.push(token); // Додаємо новий токен до масиву
      fs.writeFileSync(this.filePath, JSON.stringify(tokens, null, 2));
      console.log('Токен був успішно записаний у файл.');
    } catch (error) {
      console.error('Помилка при записі токена у файл:', error.message);
    }
  }
}
