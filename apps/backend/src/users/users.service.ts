import { Inject, Injectable } from '@nestjs/common';
import { type Drizzle, DRIZZLE } from '../db/db.provider';
import { users } from '../db/schemas';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: Drizzle) {}

  findByEmail(email: string) {
    return this.db.select().from(users).where(eq(users.email, email));
  }
}
