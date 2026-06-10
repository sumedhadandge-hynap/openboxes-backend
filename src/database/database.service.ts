import { Inject, Injectable } from '@nestjs/common';

import type { AppDatabase } from './database.module';
import { DRIZZLE } from './database.tokens';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DRIZZLE) readonly db: AppDatabase) {}
}
