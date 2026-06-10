import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AppLoggerService } from '../logger/app-logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;
    const message =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
        ? (exceptionResponse as { message: string | string[] }).message
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';
    const normalizedMessage = Array.isArray(message)
      ? message.join(', ')
      : message;

    this.logger.exception(
      {
        event: 'http_exception',
        method: request.method,
        url: request.originalUrl ?? request.url,
        statusCode,
        message: normalizedMessage,
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      'HTTP exception handled',
    );

    response.status(statusCode).json({
      success: false,
      statusCode,
      message: normalizedMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
