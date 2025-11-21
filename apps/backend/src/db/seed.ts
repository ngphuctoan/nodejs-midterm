import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { usersTable } from './schemas';
import * as bcrypt from 'bcrypt';

const USERS = [
  { name: 'Demo', email: 'demo@weather.meals', password: '123456' },
];

const SALT_OR_ROUNDS = 10;

const main = async () => {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle({ client });

  const usersData = await Promise.all(
    USERS.map(async (user) => ({
      name: user.name,
      email: user.email,
      passwordHash: await bcrypt.hash(user.password, SALT_OR_ROUNDS),
    })),
  );

  await db.insert(usersTable).values(usersData);

  await client.end();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
