import { AuthService } from '../auth/auth.service';

export function isValidToken(token: string, authService: AuthService): boolean {
  const isValid = authService.verifyToken(token);
  console.log('isTokenValid', isValid);
  return isValid;
}
