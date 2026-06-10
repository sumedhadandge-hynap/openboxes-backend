import { Injectable, OnModuleDestroy } from '@nestjs/common';
import pino, { DestinationStream, Logger } from 'pino';
import { join } from 'path';

import { LogCategory } from './log-category.enum';

type LogPayload = Record<string, unknown>;

@Injectable()
export class AppLoggerService implements OnModuleDestroy {
  private readonly loggers = {
    application: this.createLogger(
      join('logs', 'application', 'application.log'),
    ),
    applicationError: this.createLogger(
      join('logs', 'application', 'application-error.log'),
    ),
    api: this.createLogger(join('logs', 'api', 'api.log')),
    apiError: this.createLogger(join('logs', 'api', 'api-error.log')),
    auth: this.createLogger(join('logs', 'auth', 'auth.log')),
    authSecurity: this.createLogger(join('logs', 'auth', 'security.log')),
    database: this.createLogger(join('logs', 'database', 'queries.log')),
    databaseError: this.createLogger(join('logs', 'database', 'db-errors.log')),
    audit: this.createLogger(join('logs', 'audit', 'audit.log')),
    exceptions: this.createLogger(join('logs', 'exceptions', 'exceptions.log')),
  };

  info(category: LogCategory, payload: LogPayload, message: string) {
    this.baseLogger(category).info(payload, message);
  }

  warn(category: LogCategory, payload: LogPayload, message: string) {
    this.baseLogger(category).warn(payload, message);
    if (category === LogCategory.AUTH) {
      this.loggers.authSecurity.warn(payload, message);
    }
  }

  error(category: LogCategory, payload: LogPayload, message: string) {
    this.baseLogger(category).error(payload, message);
    this.errorLogger(category).error(payload, message);
  }

  audit(payload: LogPayload, message: string) {
    this.loggers.audit.info(payload, message);
  }

  database(payload: LogPayload, message: string) {
    this.loggers.database.info(payload, message);
  }

  databaseError(payload: LogPayload, message: string) {
    this.loggers.databaseError.error(payload, message);
  }

  auth(payload: LogPayload, message: string) {
    this.loggers.auth.info(payload, message);
  }

  authSecurity(payload: LogPayload, message: string) {
    this.loggers.authSecurity.warn(payload, message);
  }

  exception(payload: LogPayload, message: string) {
    this.loggers.exceptions.error(payload, message);
  }

  application(payload: LogPayload, message: string) {
    this.loggers.application.info(payload, message);
  }

  applicationError(payload: LogPayload, message: string) {
    this.loggers.applicationError.error(payload, message);
  }

  api(payload: LogPayload, message: string) {
    this.loggers.api.info(payload, message);
  }

  apiError(payload: LogPayload, message: string) {
    this.loggers.apiError.error(payload, message);
  }

  async onModuleDestroy() {
    await Promise.all(
      Object.values(this.loggers).map(
        (logger) =>
          new Promise<void>((resolve) => {
            logger.flush();
            resolve();
          }),
      ),
    );
  }

  private baseLogger(category: LogCategory): Logger {
    switch (category) {
      case LogCategory.APPLICATION:
        return this.loggers.application;
      case LogCategory.API:
        return this.loggers.api;
      case LogCategory.AUTH:
        return this.loggers.auth;
      case LogCategory.DATABASE:
        return this.loggers.database;
      case LogCategory.AUDIT:
        return this.loggers.audit;
      case LogCategory.EXCEPTIONS:
        return this.loggers.exceptions;
      default:
        return this.loggers.application;
    }
  }

  private errorLogger(category: LogCategory): Logger {
    switch (category) {
      case LogCategory.APPLICATION:
        return this.loggers.applicationError;
      case LogCategory.API:
        return this.loggers.apiError;
      case LogCategory.AUTH:
        return this.loggers.authSecurity;
      case LogCategory.DATABASE:
        return this.loggers.databaseError;
      case LogCategory.EXCEPTIONS:
        return this.loggers.exceptions;
      case LogCategory.AUDIT:
        return this.loggers.audit;
      default:
        return this.loggers.applicationError;
    }
  }

  private createLogger(filePath: string): Logger {
    const transport = pino.transport({
      target: 'pino-roll',
      options: {
        file: join(process.cwd(), filePath),
        frequency: 'daily',
        mkdir: true,
      },
    }) as DestinationStream;

    return pino(
      {
        level: process.env.LOG_LEVEL ?? 'info',
        base: {
          service: 'openboxes-backend',
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => ({ level: label }),
        },
      },
      transport,
    );
  }
}
