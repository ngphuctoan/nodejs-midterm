import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { SupabaseModule } from '../storage/storage.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [SupabaseModule],
  providers: [PrismaService, RecipesService],
  controllers: [RecipesController],
})
export class RecipesModule {}
