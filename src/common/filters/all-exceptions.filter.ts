import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ERROR_MESSAGES } from '../errors/error-messages.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logException(request, exception, status);

    response.status(status).json({
      error: this.getMessage(exception, status),
    });
  }

  private logException(
    request: Request,
    exception: unknown,
    status: number,
  ): void {
    const message = `${request.method} ${request.originalUrl} ${status}`;
    const details = exception instanceof Error ? exception.stack : String(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(message, details);
      return;
    }

    this.logger.warn(`${message} - ${this.getMessage(exception, status)}`);
  }

  private getMessage(exception: unknown, status: number): string {
    if (!(exception instanceof HttpException)) {
      return status === HttpStatus.INTERNAL_SERVER_ERROR
        ? ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        : ERROR_MESSAGES.REQUEST_FAILED;
    }

    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const responseBody = exceptionResponse as {
        error?: unknown;
        message?: unknown;
      };

      if (Array.isArray(responseBody.message)) {
        return String(
          responseBody.message[0] ?? ERROR_MESSAGES.INVALID_REQUEST,
        );
      }

      if (typeof responseBody.message === 'string') {
        return responseBody.message;
      }

      if (typeof responseBody.error === 'string') {
        return responseBody.error;
      }
    }

    return status === HttpStatus.INTERNAL_SERVER_ERROR
      ? ERROR_MESSAGES.INTERNAL_SERVER_ERROR
      : ERROR_MESSAGES.REQUEST_FAILED;
  }
}
