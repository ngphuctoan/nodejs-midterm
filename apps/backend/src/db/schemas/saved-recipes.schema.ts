import { integer, jsonb, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { usersTable } from './user.schema';
import { RecipeInfo } from '../../types/recipe-info';

export const savedRecipesTable = pgTable('saved_recipes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  info: jsonb('info').$type<RecipeInfo>().notNull(),
  ownerId: integer('owner_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
