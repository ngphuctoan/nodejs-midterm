import { Test, TestingModule } from '@nestjs/testing';
import { SavedRecipesService } from './saved-recipes.service';
import { PrismaService } from '../prisma.service';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import fs from 'node:fs/promises';

describe('SavedRecipesService (Integration)', () => {
  let savedRecipesService: SavedRecipesService;
  let prisma: PrismaClient;
  let supabase: DeepMockProxy<SupabaseClient>;
  let user: Prisma.usersModel;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedRecipesService,
        PrismaService,
        {
          provide: SUPABASE,
          useValue: mockDeep<SupabaseClient>(),
        },
      ],
    }).compile();

    savedRecipesService = module.get(SavedRecipesService);
    prisma = module.get(PrismaService);
    supabase = module.get(SUPABASE);

    user = await prisma.users.upsert({
      where: { email: 'kirby@remun.ch' },
      update: {},
      create: {
        name: 'Kirby',
        email: 'kirby@remun.ch',
        password_hash: 'poyo',
      },
    });
  });

  it('should return all saved recipes', async () => {
    const savedRecipes = [
      {
        info: { name: 'Com tam' },
        owner_id: user.id,
      },
      {
        info: { name: 'Pho bo' },
        owner_id: user.id,
      },
      {
        info: { name: 'Banh trang' },
        owner_id: user.id,
      },
    ];
    await prisma.saved_recipes.createMany({
      data: savedRecipes,
    });

    const result = await savedRecipesService.findAll(user.id);

    expect(result).toMatchObject(savedRecipes);
  });

  it('should return one saved recipe', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
      owner_id: user.id,
    };
    const data = await prisma.saved_recipes.create({
      data: savedRecipe,
    });

    const result = await savedRecipesService.findOne(data.owner_id, data.id);

    expect(result).toMatchObject(savedRecipe);
  });

  it('should create new saved recipe', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
    };

    const result = await savedRecipesService.create(user.id, savedRecipe);

    expect(result).toMatchObject(savedRecipe);
  });

  it('should get image url for saved recipe', async () => {
    const savedRecipe = {
      info: {
        name: 'Com tam',
        image: 'images/com-tam-s5p4b4s3.avif',
      },
      owner_id: user.id,
    };
    const data = await prisma.saved_recipes.create({
      data: savedRecipe,
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'supabase_is_awesome!' },
        error: null,
      }),
    });

    const result = await savedRecipesService.getImage(data.owner_id, data.id);

    expect(result).toEqual('supabase_is_awesome!');
  });

  it('should update existing saved recipe', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
      owner_id: user.id,
    };
    const data = await prisma.saved_recipes.create({
      data: savedRecipe,
    });

    const result = await savedRecipesService.update(data.owner_id, data.id, {
      info: { name: 'Com suon' },
    });

    expect(result.info.name).toEqual('Com suon');
  });

  it('should upload an image', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
      owner_id: user.id,
    };
    const data = await prisma.saved_recipes.create({
      data: savedRecipe,
    });
    const path = 'images/com-tam-s5p4b4s3.avif';
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: { path },
        error: null,
      }),
    });
    const image = await fs.readFile('test/test-image.jpeg');

    const result = await savedRecipesService.uploadImage(
      data.owner_id,
      data.id,
      image as unknown as Express.Multer.File,
    );

    expect(result.info.image).toEqual(path);
  }, 10_000);

  it('should delete a saved recipe', async () => {
    const savedRecipe = {
      info: { name: 'Com tam' },
      owner_id: user.id,
    };
    const data = await prisma.saved_recipes.create({
      data: savedRecipe,
    });

    const result = await savedRecipesService.delete(data.owner_id, data.id);

    expect(result).toMatchObject(savedRecipe);
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.users.delete({
        where: { id: user.id },
      }),
      prisma.saved_recipes.deleteMany(),
    ]);
    await prisma.$disconnect();
  });
});
