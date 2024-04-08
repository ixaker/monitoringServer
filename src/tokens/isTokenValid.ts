import { TokenService } from "./tokens";
import { AuthService } from './../auth/auth.service'


export function isValidToken(token: string): boolean {
    
        const isValid = this.authService.verifyToken(token);
        console.log('isTokenValid', isValid)
        return isValid
    
 
}