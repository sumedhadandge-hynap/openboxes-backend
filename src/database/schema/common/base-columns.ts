import {
  boolean,
  integer,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const baseColumns = {
  id: integer('id')
    .primaryKey()
    .generatedAlwaysAsIdentity(),

  uid: uuid('uid')
    .defaultRandom()
    .notNull(),

  isActive: boolean('is_active')
    .notNull()
    .default(true),

  isDeleted: boolean('is_deleted')
    .notNull()
    .default(false),

  createdBy: integer('created_by'),

  updatedBy: integer('updated_by'),

  deletedBy: integer('deleted_by'),

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