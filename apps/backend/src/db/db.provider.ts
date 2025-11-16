import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schemas from '../db/schemas';

export const DRIZZLE = 'DRIZZLE';

export type Drizzle = NodePgDatabase<typeof schemas>;

export const drizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () =>
    drizzle({
      client: postgres(process.env.DATABASE_URL!),
    }),
};
