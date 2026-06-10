import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { AppLoggerService } from '../logger/app-logger.service';
import { LogCategory } from '../logger/log-category.enum';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    const url = request.originalUrl ?? request.url;

    this.logger.info(
      LogCategory.API,
      {
        event: 'http_request',
        method: request.method,
        url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
      'HTTP request received',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.info(
            LogCategory.API,
            {
              event: 'http_response',
              method: request.method,
              url,
              statusCode: response.statusCode,
              durationMs: Date.now() - startedAt,
            },
            'HTTP response sent',
          );
        },
        error: (error: unknown) => {
          this.logger.error(
            LogCategory.API,
            {
              event: 'http_response_error',
              method: request.method,
              url,
              statusCode: response.statusCode,
              durationMs: Date.now() - startedAt,
              error:
                error instanceof Error
                  ? { name: error.name, message: error.message }
                  : { message: 'Unknown error' },
            },
            'HTTP request failed',
          );
        },
      }),
    );
  }
}
