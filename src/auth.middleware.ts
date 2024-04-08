// auth.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers.authorization;
    if (!accessToken || accessToken !== 'your_access_token') {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    next();
  }
}