import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { AppLoggerService } from '../common/logger/app-logger.service';
import { DatabaseService } from './database.service';
import { DRIZZLE, POSTGRES_CLIENT } from './database.tokens';
import * as schema from './schema';

export type AppDatabase = PostgresJsDatabase<typeof schema>;

class DatabaseShutdownService implements OnApplicationShutdown {
  constructor(
    @Inject(POSTGRES_CLIENT)
    private readonly client: postgres.Sql,
  ) {}

  async onApplicationShutdown() {
    await this.client.end({ timeout: 5 });
  }
}

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        postgres(configService.getOrThrow<string>('database.url'), {
          prepare: false,
        }),
    },
    {
      provide: DRIZZLE,
      inject: [POSTGRES_CLIENT, ConfigService, AppLoggerService],
      useFactory: (
        client: postgres.Sql,
        configService: ConfigService,
        logger: AppLoggerService,
      ) =>
        drizzle(client, {
          schema,
          logger: {
            logQuery: (query, params) => {
              logger.database(
                {
                  event: 'drizzle_query',
                  query,
                  paramsCount: params.length,
                  nodeEnv: configService.get<string>('app.nodeEnv'),
                },
                'Drizzle query executed',
              );
            },
          },
        }),
    },
    DatabaseShutdownService,
    DatabaseService,
  ],
  exports: [DRIZZLE, DatabaseService],
})
export class DatabaseModule {}
