import { Inject, Injectable } from '@nestjs/common';
import { type Drizzle, DRIZZLE } from '../db/db.provider';
import { usersTable } from '../db/schemas';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: Drizzle) {}

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return user;
  }

  async create(data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [user] = await this.db
      .insert(usersTable)
      .values({
        name: data.name,
        email: data.email,
        passwordHash,
      })
      .returning();
    return user;
  }
}
