import 'express';
import { usersTable } from '../db/schemas';

declare module 'express' {
  export interface Request {
    user: Omit<typeof usersTable.$inferSelect, 'passwordHash'>;
  }
}
