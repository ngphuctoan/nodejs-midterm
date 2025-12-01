import { Test, TestingModule } from '@nestjs/testing';
import { SavedRecipesService } from './saved-recipes.service';

describe('SavedRecipesService', () => {
  let service: SavedRecipesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedRecipesService],
    }).compile();

    service = module.get<SavedRecipesService>(SavedRecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
