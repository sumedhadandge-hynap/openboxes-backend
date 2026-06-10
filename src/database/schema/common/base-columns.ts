import { boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

export const baseColumns = {
  id: uuid('id').primaryKey().defaultRandom(),

  isActive: boolean('is_active').notNull().default(true),

  isDeleted: boolean('is_deleted').notNull().default(false),

  createdBy: uuid('created_by'),

  updatedBy: uuid('updated_by'),

  deletedBy: uuid('deleted_by'),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  deletedAt: timestamp('deleted_at', {
    withTimezone: true,
  }),
};
