import { registerAs } from '@nestjs/config';

import { DEFAULT_PORT } from '../common/constants/app.constant';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? DEFAULT_PORT),
  logLevel: process.env.LOG_LEVEL ?? 'info',
  corsOrigin: process.env.CORS_ORIGIN,
}));
