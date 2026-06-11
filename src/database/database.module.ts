import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

import * as schema from './schema';

import { DatabaseService } from './database.service';
import { DRIZZLE, POSTGRES_CLIENT } from './database.tokens';

const connectionFactory = (config: ConfigService) =>
  postgres(
    config.getOrThrow<string>('database.url'),
  );

export type DbType = ReturnType<
  typeof drizzle<typeof schema>
>;

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_CLIENT,
      inject: [ConfigService],
      useFactory: connectionFactory,
    },

    {
      provide: DRIZZLE,
      inject: [POSTGRES_CLIENT],
      useFactory: (client: postgres.Sql) =>
        drizzle(client, {
          schema,
        }),
    },

    DatabaseService,
  ],

  exports: [
    DRIZZLE,
    DatabaseService,
  ],
})
export class DatabaseModule {}