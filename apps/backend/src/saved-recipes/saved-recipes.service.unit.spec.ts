import { Test, TestingModule } from '@nestjs/testing';
import { SavedRecipesService } from './saved-recipes.service';
import { PrismaService } from '../prisma.service';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import sharp from 'sharp';

describe('SavedRecipesService (Unit)', () => {
  let savedRecipesService: SavedRecipesService;
  let prisma: DeepMockProxy<PrismaClient>;
  let supabase: DeepMockProxy<SupabaseClient>;

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

    savedRecipesService = module.get(SavedRecipesService);
    prisma = module.get(PrismaService);
    supabase = module.get(SUPABASE);
  });

  it('should return all saved recipes', async () => {
    const savedRecipes = [
      { info: { name: 'Com tam' } },
      { info: { name: 'Pho bo' } },
      { info: { name: 'Banh trang' } },
    ] as Prisma.saved_recipesModel[];
    prisma.saved_recipes.findMany.mockResolvedValue(savedRecipes);

    const result = await savedRecipesService.findAll(1);

    expect(result).toEqual(savedRecipes);
  });

  it('should return one saved recipe', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.findUnique.mockResolvedValue(savedRecipe);

    const result = await savedRecipesService.findOne(1, 1);

    expect(result).toMatchObject(savedRecipe);
  });

  it('should throw if saved recipe not found', async () => {
    prisma.saved_recipes.findUnique.mockResolvedValue(null);

    await expect(savedRecipesService.findOne(1, 4)).rejects.toThrow(
      'Saved recipe not found',
    );
  });

  it('should create new saved recipe', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.create.mockResolvedValue(savedRecipe);

    const result = await savedRecipesService.create(1, {
      info: { name: 'Com tam' },
    });

    expect(result).toEqual(savedRecipe);
  });

  it('should get image url for saved recipe', async () => {
    const savedRecipe = {
      info: { image: 'images/com-tam-s5p4b4s3.avif' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.findUnique.mockResolvedValue(savedRecipe);
    (supabase.storage.from as jest.Mock).mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'supabase_is_awesome!' },
        error: null,
      }),
    });

    const result = await savedRecipesService.getImage(1, 1);

    expect(result).toEqual('supabase_is_awesome!');
  });

  it('should throw for image if saved recipe not found', async () => {
    prisma.saved_recipes.findUnique.mockResolvedValue(null);

    await expect(savedRecipesService.getImage(1, 4)).rejects.toThrow(
      'Saved recipe not found',
    );
  });

  it('should return no image if saved recipe does not have image', async () => {
    const savedRecipe = {
      info: { image: undefined },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.findUnique.mockResolvedValue(savedRecipe);

    const result = await savedRecipesService.getImage(1, 4);

    expect(result).toEqual(undefined);
  });

  it('should return no image if supabase fails', async () => {
    const savedRecipe = {
      info: { image: 'images/com-tam-s5p4b4s3.avif' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.findUnique.mockResolvedValue(savedRecipe);
    (supabase.storage.from as jest.Mock).mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'wow, such empty' },
      }),
    });

    const result = await savedRecipesService.getImage(1, 4);

    expect(result).toEqual(undefined);
  });

  it('should update existing saved recipe', async () => {
    const savedRecipe = {
      info: { name: 'Com suon' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.update.mockResolvedValue(savedRecipe);
    prisma.saved_recipes.findUnique.mockResolvedValue({
      info: { name: 'Com tam' },
    } as Prisma.saved_recipesModel);

    const result = await savedRecipesService.update(1, 1, {
      info: { name: 'Com suon' },
    });

    expect(result).toEqual(savedRecipe);
  });

  it('should throw when updating if saved recipe not found', async () => {
    await expect(
      savedRecipesService.update(1, 4, {
        info: { name: 'Bun dau mam tom' },
      }),
    ).rejects.toThrow('Saved recipe not found');
  });

  it('should upload an image', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.findUnique.mockResolvedValue(savedRecipe);
    jest.spyOn(sharp.prototype, 'resize').mockReturnValue({
      avif: jest.fn().mockReturnValue({
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('hello_from_avif')),
      }),
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: { path: 'pls_support_jxl' },
        error: null,
      }),
    });
    const updated = {
      info: { image: 'images/com-tam-s5p4b4s3.avif' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.update.mockResolvedValue(updated);

    const result = await savedRecipesService.uploadImage(1, 1, {
      buffer: Buffer.from('hello_from_avif'),
      mimetype: 'image/jpeg',
    } as Express.Multer.File);

    expect(result).toEqual(updated);
  });

  it('should stop early when no image provided', async () => {
    await expect(savedRecipesService.uploadImage(1, 1)).rejects.toThrow(
      'No image uploaded',
    );
  });

  it('should throw when uploading image if saved recipe not found', async () => {
    prisma.saved_recipes.findUnique.mockResolvedValue(null);

    await expect(
      savedRecipesService.uploadImage(1, 1, {
        buffer: Buffer.from('hello_from_avif'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File),
    ).rejects.toThrow('Saved recipe not found');
  });

  it('should throw when uploading image if supabase fails', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.findUnique.mockResolvedValue(savedRecipe);
    jest.spyOn(sharp.prototype, 'resize').mockReturnValue({
      avif: jest.fn().mockReturnValue({
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('hello_from_avif')),
      }),
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'sorry server exploded' },
      }),
    });

    await expect(
      savedRecipesService.uploadImage(1, 1, {
        buffer: Buffer.from('hello_from_avif'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File),
    ).rejects.toThrow('sorry server exploded');
  });

  it('should delete a saved recipe', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
    } as Prisma.saved_recipesModel;
    prisma.saved_recipes.delete.mockResolvedValue(savedRecipe);

    const result = await savedRecipesService.delete(1, 1);

    expect(result).toEqual(savedRecipe);
  });
});
