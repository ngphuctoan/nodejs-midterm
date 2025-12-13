import 'express';
import { Prisma } from '../generated/prisma/client';

declare module 'express' {
  export interface Request {
    user: Prisma.usersGetPayload<{
      select: { id: true; name: true; email: true };
    }>;
  }
}
