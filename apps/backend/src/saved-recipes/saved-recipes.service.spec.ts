import { Test, TestingModule } from '@nestjs/testing';
import { SavedRecipesService } from './saved-recipes.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '../generated/prisma/client';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { mockDeep } from 'jest-mock-extended';

describe('SavedRecipesService', () => {
  let service: SavedRecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedRecipesService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
        {
          provide: SUPABASE,
          useValue: mockDeep<SupabaseClient>(),
        },
      ],
    }).compile();

    service = module.get<SavedRecipesService>(SavedRecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
