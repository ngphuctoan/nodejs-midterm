import { Module } from '@nestjs/common';
import { DrizzleModule } from '../db/db.module';
import { SupabaseModule } from '../storage/storage.module';
import { SavedRecipesService } from './saved-recipes.service';
import { SavedRecipesController } from './saved-recipes.controller';

@Module({
  imports: [DrizzleModule, SupabaseModule],
  providers: [SavedRecipesService],
  controllers: [SavedRecipesController],
})
export class SavedRecipesModule {}
