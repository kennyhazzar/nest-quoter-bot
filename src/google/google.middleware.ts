import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { GoogleService } from './google.service';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(private readonly googleService: GoogleService) {}
  async use(request: Request, response: Response, next: NextFunction) {
    const { expiresIn, updateTokenTimestamp } = this.googleService;
    if (Date.now() - updateTokenTimestamp >= expiresIn) {
      console.log('updated');
      await this.googleService.updateAccessToken();
    }
    next();
  }
}
