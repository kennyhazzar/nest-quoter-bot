import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { GoogleService } from './google.service';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(private readonly googleService: GoogleService) {}
  async use(request: Request, response: Response, next: NextFunction) {
    const { expiresIn, updateTokenTimestamp } = this.googleService;
    if (Date.now() - updateTokenTimestamp > expiresIn) {
      await this.googleService.updateAccessToken();
    }
    const sheet = await this.googleService.getCurrentSpreadsheet();
    if (sheet) {
      this.googleService.spreadsheetInfo = sheet;
    } else {
      throw new HttpException(
        {
          result: 'error',
          error: 'google sheet is not valid',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    next();
  }
}
