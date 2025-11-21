import { Module } from '@nestjs/common';
import { supabaseProvider } from './storage.provider';

@Module({
  providers: [supabaseProvider],
  exports: [supabaseProvider],
})
export class SupabaseModule {}
