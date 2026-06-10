import { Global, Module } from '@nestjs/common';

import { HttpExceptionFilter } from '../filters/http-exception.filter';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { ResponseInterceptor } from '../interceptors/response.interceptor';
import { AppLoggerService } from './app-logger.service';

@Global()
@Module({
  providers: [
    AppLoggerService,
    LoggingInterceptor,
    ResponseInterceptor,
    HttpExceptionFilter,
  ],
  exports: [
    AppLoggerService,
    LoggingInterceptor,
    ResponseInterceptor,
    HttpExceptionFilter,
  ],
})
export class AppLoggerModule {}
