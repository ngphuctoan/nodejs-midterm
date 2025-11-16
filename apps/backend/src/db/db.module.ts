import { Module } from '@nestjs/common';
import { drizzleProvider } from './db.provider';

@Module({
  providers: [drizzleProvider],
  exports: [drizzleProvider],
})
export class DrizzleModule {}
