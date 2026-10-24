import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = Date.now();

    response.on('finish', () => {
      const duration = Date.now() - startedAt;
      const body =
        request.method === 'POST' ? ` body=${JSON.stringify(request.body)}` : '';

      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} - ${duration}ms${body}`,
      );
    });

    next();
  }
}
