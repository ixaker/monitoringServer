// src/auth/password.validator.ts
export class PasswordValidator {
  static validate(password: string): string | null {
    const errors: string[] = [];

    if (!password) errors.push('Пароль не может быть пустым');
    if (password.length < 8) errors.push('Минимум 8 символов');
    if (!/[A-Z]/.test(password)) errors.push('Хотя бы одна заглавная буква');
    if (!/[a-z]/.test(password)) errors.push('Хотя бы одна строчная буква');
    if (!/[0-9]/.test(password)) errors.push('Хотя бы одна цифра');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Хотя бы один спецсимвол');
    }

    return errors.length ? errors.join(', ') : null;
  }
}
