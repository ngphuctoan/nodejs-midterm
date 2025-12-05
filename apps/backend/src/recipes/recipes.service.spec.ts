import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { PrismaService } from '../prisma.service';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import sharp from 'sharp';

describe('RecipesService', () => {
  let recipesService: RecipesService;
  let prisma: DeepMockProxy<PrismaClient>;
  let supabase: DeepMockProxy<SupabaseClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
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

    recipesService = module.get(RecipesService);
    prisma = module.get(PrismaService);
    supabase = module.get(SUPABASE);
  });

  it('should return all recipes', async () => {
    const recipes = [
      { info: { name: 'Com tam' } },
      { info: { name: 'Pho bo' } },
      { info: { name: 'Banh trang' } },
    ] as Prisma.recipesModel[];
    prisma.recipes.findMany.mockResolvedValue(recipes);

    const result = await recipesService.findAll(1);

    expect(result).toEqual(recipes);
  });

  it('should return one recipe', async () => {
    const recipe = { info: { name: 'Com tam' } } as Prisma.recipesModel;
    prisma.recipes.findUnique.mockResolvedValue(recipe);

    const result = await recipesService.findOne(1, 1);

    expect(result).toMatchObject(recipe);
  });

  it('should throw if recipe not found', async () => {
    prisma.recipes.findUnique.mockResolvedValue(null);

    await expect(recipesService.findOne(1, 4)).rejects.toThrow(
      'Recipe not found',
    );
  });

  it('should create new recipe', async () => {
    const recipe = { info: { name: 'Com tam' } } as Prisma.recipesModel;
    prisma.recipes.create.mockResolvedValue(recipe);

    const result = await recipesService.create(1, {
      info: { name: 'Com tam' },
    });

    expect(result).toEqual(recipe);
  });

  it('should get image url for recipe', async () => {
    const recipe = {
      info: { image: 'images/com-tam-s5p4b4s3.avif' },
    } as Prisma.recipesModel;
    prisma.recipes.findUnique.mockResolvedValue(recipe);
    (supabase.storage.from as jest.Mock).mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'supabase_is_awesome!' },
        error: null,
      }),
    });

    const result = await recipesService.getImage(1, 1);

    expect(result).toEqual('supabase_is_awesome!');
  });

  it('should throw for image if recipe not found', async () => {
    prisma.recipes.findUnique.mockResolvedValue(null);

    await expect(recipesService.getImage(1, 4)).rejects.toThrow(
      'Recipe not found',
    );
  });

  it('should return no image if recipe does not have image', async () => {
    const recipe = {
      info: { image: undefined },
    } as Prisma.recipesModel;
    prisma.recipes.findUnique.mockResolvedValue(recipe);

    const result = await recipesService.getImage(1, 4);

    expect(result).toEqual(undefined);
  });

  it('should return no image if supabase fails', async () => {
    const recipe = {
      info: { image: 'images/com-tam-s5p4b4s3.avif' },
    } as Prisma.recipesModel;
    prisma.recipes.findUnique.mockResolvedValue(recipe);
    (supabase.storage.from as jest.Mock).mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'wow, such empty' },
      }),
    });

    const result = await recipesService.getImage(1, 4);

    expect(result).toEqual(undefined);
  });

  it('should update existing recipe', async () => {
    const recipe = {
      info: { name: 'Com suon' },
    } as Prisma.recipesModel;
    prisma.recipes.update.mockResolvedValue(recipe);
    prisma.recipes.findUnique.mockResolvedValue({
      info: { name: 'Com tam' },
    } as Prisma.recipesModel);

    const result = await recipesService.update(1, 1, {
      info: { name: 'Com suon' },
    });

    expect(result).toEqual(recipe);
  });

  it('should throw when updating if recipe not found', async () => {
    await expect(
      recipesService.update(1, 4, {
        info: { name: 'Bun dau mam tom' },
      }),
    ).rejects.toThrow('Recipe not found');
  });

  it('should upload an image', async () => {
    const recipe = { info: { name: 'Com tam' } } as Prisma.recipesModel;
    prisma.recipes.findUnique.mockResolvedValue(recipe);
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
    } as Prisma.recipesModel;
    prisma.recipes.update.mockResolvedValue(updated);

    const result = await recipesService.uploadImage(1, 1, {
      buffer: Buffer.from('hello_from_avif'),
      mimetype: 'image/jpeg',
    } as Express.Multer.File);

    expect(result).toEqual(updated);
  });

  it('should stop early when no image provided', async () => {
    await expect(recipesService.uploadImage(1, 1)).rejects.toThrow(
      'No image uploaded',
    );
  });

  it('should throw when uploading image if recipe not found', async () => {
    prisma.recipes.findUnique.mockResolvedValue(null);

    await expect(
      recipesService.uploadImage(1, 1, {
        buffer: Buffer.from('hello_from_avif'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File),
    ).rejects.toThrow('Recipe not found');
  });

  it('should throw when uploading image if supabase fails', async () => {
    const recipe = { info: { name: 'Com tam' } } as Prisma.recipesModel;
    prisma.recipes.findUnique.mockResolvedValue(recipe);
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
      recipesService.uploadImage(1, 1, {
        buffer: Buffer.from('hello_from_avif'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File),
    ).rejects.toThrow('sorry server exploded');
  });
});
