import { text } from 'drizzle-orm/pg-core';

export const identityColumns = {
  name: text('name').notNull(),
  description: text('description'),
};