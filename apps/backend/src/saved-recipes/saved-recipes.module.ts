import { Module } from '@nestjs/common';
import { SupabaseModule } from '../storage/storage.module';
import { SavedRecipesService } from './saved-recipes.service';
import { SavedRecipesController } from './saved-recipes.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [SupabaseModule],
  providers: [PrismaService, SavedRecipesService],
  controllers: [SavedRecipesController],
})
export class SavedRecipesModule {}
