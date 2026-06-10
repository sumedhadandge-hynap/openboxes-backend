import { text } from 'drizzle-orm/pg-core';

export const identityColumns = {
  name: text('name').notNull().unique(),
  description: text('description'),
};
