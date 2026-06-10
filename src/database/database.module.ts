import {
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as dbSchema from './schema';

export type DbType = NodePgDatabase<typeof dbSchema>;

@Global()
@Module({
  providers: [
    {
      provide: 'DB_POOL',
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<Pool> => {
        const logger = new Logger('DatabaseModule');

        const connectionString =
          configService.get<string>('database.url') ||
          configService.get<string>('DATABASE_URL');

        if (!connectionString) {
          throw new Error('DATABASE_URL not found');
        }

        const pool = new Pool({
          connectionString,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

        await pool.query('SELECT 1');

        logger.log('Database connected successfully');

        return pool;
      },
    },

    {
      provide: 'DB',
      inject: ['DB_POOL'],
      useFactory: (pool: Pool): DbType => {
        return drizzle(pool, {
          schema: dbSchema,
        });
      },
    },
  ],
  exports: ['DB', 'DB_POOL'],
})
export class DatabaseModule implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    @Inject('DB_POOL')
    private readonly dbPool: Pool,
  ) {}

  async onModuleDestroy() {
    await this.dbPool.end();
    this.logger.log('Database pool closed');
  }
}