import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { RateLimitService } from '../../bookings/rate-limit.service.js';
import { ERROR_MESSAGES } from '../errors/error-messages.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly rateLimitService: RateLimitService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const email = this.getEmail(request.body);

    if (!email) {
      return true;
    }

    const result = this.rateLimitService.check(email);

    if (!result.allowed) {
      response.setHeader('Retry-After', result.retryAfterSeconds ?? 1);
      throw new HttpException(
        { error: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getEmail(body: unknown): string | undefined {
    if (typeof body !== 'object' || body === null || !('email' in body)) {
      return undefined;
    }

    const email = body.email;

    if (typeof email !== 'string') {
      return undefined;
    }

    const normalizedEmail = email.trim().toLowerCase();
    return normalizedEmail || undefined;
  }
}
