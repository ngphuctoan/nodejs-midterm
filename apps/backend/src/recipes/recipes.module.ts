import { Module } from '@nestjs/common';
import { DrizzleModule } from '../db/db.module';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { SupabaseModule } from '../storage/storage.module';

@Module({
  imports: [DrizzleModule, SupabaseModule],
  providers: [RecipesService],
  controllers: [RecipesController],
})
export class RecipesModule {}
