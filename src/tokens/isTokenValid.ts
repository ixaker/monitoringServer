import { AuthService } from '../auth/auth.service.js';

export function isValidToken(token: string, authService: AuthService): boolean {
  const isValid = authService.verifyToken(token);
  console.log('isTokenValid', isValid);
  return isValid;
}
