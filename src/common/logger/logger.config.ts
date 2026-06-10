import { Params } from 'nestjs-pino';
import { join } from 'path';

export function createLoggerConfig(logLevel: string, nodeEnv: string): Params {
  return {
    pinoHttp: {
      level: logLevel,
      autoLogging: false,
      timestamp: true,
      base: {
        service: 'openboxes-backend',
        category: 'application',
      },
      transport:
        nodeEnv === 'development'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : {
              target: 'pino-roll',
              options: {
                file: join(
                  process.cwd(),
                  'logs',
                  'application',
                  'application.log',
                ),
                frequency: 'daily',
                mkdir: true,
              },
            },
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
  };
}
