import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { ERROR_MESSAGES } from '../errors/error-messages.js';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const receivedKey = request.header('X-API-Key');
    const expectedKey = this.configService.getOrThrow<string>('API_KEY');

    if (receivedKey !== expectedKey) {
      throw new UnauthorizedException({
        error: ERROR_MESSAGES.INVALID_API_KEY,
      });
    }

    return true;
  }
}
