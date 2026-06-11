import { Inject, Injectable } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { DRIZZLE } from './database.tokens';
import * as schema from './schema';

export type AppDatabase =
  PostgresJsDatabase<typeof schema>;

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(DRIZZLE)
    public readonly db: AppDatabase,
  ) {}
}