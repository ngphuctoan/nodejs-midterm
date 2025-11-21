import 'express';
import { users } from '../db/schemas';

declare module 'express' {
  export interface Request {
    user: Omit<typeof users.$inferSelect, 'passwordHash'>;
  }
}
