import { Injectable, OnModuleDestroy } from '@nestjs/common';
import pino, { DestinationStream, Logger } from 'pino';
import { join } from 'path';

import { LogCategory } from './log-category.enum';

type LogPayload = Record<string, unknown>;

@Injectable()
export class AppLoggerService implements OnModuleDestroy {
  private readonly loggers = new Map<LogCategory, Logger>();

  constructor() {
    for (const category of Object.values(LogCategory)) {
      this.loggers.set(category, this.createCategoryLogger(category));
    }
  }

  info(category: LogCategory, payload: LogPayload, message: string) {
    this.getLogger(category).info(payload, message);
  }

  warn(category: LogCategory, payload: LogPayload, message: string) {
    this.getLogger(category).warn(payload, message);
  }

  error(category: LogCategory, payload: LogPayload, message: string) {
    this.getLogger(category).error(payload, message);
  }

  audit(payload: LogPayload, message: string) {
    this.info(LogCategory.AUDIT, payload, message);
  }

  database(payload: LogPayload, message: string) {
    this.info(LogCategory.DATABASE, payload, message);
  }

  auth(payload: LogPayload, message: string) {
    this.info(LogCategory.AUTH, payload, message);
  }

  exception(payload: LogPayload, message: string) {
    this.error(LogCategory.EXCEPTIONS, payload, message);
  }

  async onModuleDestroy() {
    await Promise.all(
      [...this.loggers.values()].map(
        (logger) =>
          new Promise<void>((resolve) => {
            logger.flush();
            resolve();
          }),
      ),
    );
  }

  private getLogger(category: LogCategory): Logger {
    const logger = this.loggers.get(category);
    if (!logger) {
      throw new Error(`Logger category is not configured: ${category}`);
    }

    return logger;
  }

  private createCategoryLogger(category: LogCategory): Logger {
    const transport = pino.transport({
      target: 'pino-roll',
      options: {
        file: join(process.cwd(), 'logs', `${category}.log`),
        frequency: 'daily',
        mkdir: true,
      },
    }) as DestinationStream;

    return pino(
      {
        level: process.env.LOG_LEVEL ?? 'info',
        base: {
          service: 'openboxes-backend',
          category,
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
