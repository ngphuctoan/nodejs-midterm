import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StorageCleanupService } from './storage-cleanup.service';
import { supabaseProvider } from './storage.provider';

@Module({
  providers: [supabaseProvider, PrismaService, StorageCleanupService],
  exports: [supabaseProvider],
})
export class SupabaseModule {}
