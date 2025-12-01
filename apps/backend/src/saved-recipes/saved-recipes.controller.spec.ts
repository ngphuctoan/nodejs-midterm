import { Test, TestingModule } from '@nestjs/testing';
import { SavedRecipesController } from './saved-recipes.controller';

describe('SavedRecipesController', () => {
  let controller: SavedRecipesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedRecipesController],
    }).compile();

    controller = module.get<SavedRecipesController>(SavedRecipesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
