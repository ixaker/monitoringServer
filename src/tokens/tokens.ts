import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class TokenService {
  //   private filePath = path.join(__dirname, './../../tokens.json');
  private filePath: string = 'tokens.json';

  readTokensFromFile(): string[] {
    console.log(this.filePath);
    try {
      const tokensData = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(tokensData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Помилка при читанні файлу токенів:', error.message);
      } else {
        console.error('Невідома помилка при читанні файлу токенів');
      }
      return [];
    }
  }

  writeTokensToFile(token: string): void {
    try {
      const tokens: string[] = this.readTokensFromFile(); // Отримуємо поточні токени з файлу
      tokens.push(token); // Додаємо новий токен до масиву
      fs.writeFileSync(this.filePath, JSON.stringify(tokens, null, 2));
      console.log('Токен був успішно записаний у файл.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Помилка при записі токена у файл:', error.message);
      } else {
        console.error('Невідома помилка при записі токена у файл');
      }
    }
  }
}
