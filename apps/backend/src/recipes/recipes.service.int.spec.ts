import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { PrismaService } from '../prisma.service';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { SUPABASE } from '../storage/storage.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import fs from 'node:fs/promises';

describe('RecipesService (Integration)', () => {
  let recipesService: RecipesService;
  let prisma: PrismaClient;
  let supabase: DeepMockProxy<SupabaseClient>;
  let user: Prisma.usersModel;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        PrismaService,
        {
          provide: SUPABASE,
          useValue: mockDeep<SupabaseClient>(),
        },
      ],
    }).compile();

    recipesService = module.get(RecipesService);
    prisma = module.get(PrismaService);
    supabase = module.get(SUPABASE);

    user = await prisma.users.upsert({
      where: { email: 'waddle_doo@remun.ch' },
      update: {},
      create: {
        name: 'Waddle Doo',
        email: 'waddle_doo@remun.ch',
        password_hash: 'BEAM_ATTACK!!!',
      },
    });
  });

  it('should return all recipes', async () => {
    const recipes = [
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
    await prisma.recipes.createMany({
      data: recipes,
    });

    const result = await recipesService.findAll(user.id);

    expect(result).toMatchObject(recipes);
  });

  it('should return one recipe', async () => {
    const recipe = {
      info: { name: 'Com tam' },
      owner_id: user.id,
    };
    const data = await prisma.recipes.create({
      data: recipe,
    });

    const result = await recipesService.findOne(data.owner_id, data.id);

    expect(result).toMatchObject(recipe);
  });

  it('should create new recipe', async () => {
    const recipe = {
      info: { name: 'Com tam' },
    };

    const result = await recipesService.create(user.id, recipe);

    expect(result).toMatchObject(recipe);
  });

  it('should get image url for recipe', async () => {
    const recipe = {
      info: {
        name: 'Com tam',
        image: 'images/com-tam-s5p4b4s3.avif',
      },
      owner_id: user.id,
    };
    const data = await prisma.recipes.create({
      data: recipe,
    });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'supabase_is_awesome!' },
        error: null,
      }),
    });

    const result = await recipesService.getImage(data.owner_id, data.id);

    expect(result).toEqual('supabase_is_awesome!');
  });

  it('should update existing recipe', async () => {
    const recipe = {
      info: { name: 'Com tam' },
      owner_id: user.id,
    };
    const data = await prisma.recipes.create({
      data: recipe,
    });

    const result = await recipesService.update(data.owner_id, data.id, {
      is_done: true,
    });

    expect(result).toMatchObject({
      info: { name: 'Com tam' },
      is_done: true,
    });
  });

  it('should upload an image', async () => {
    const recipe = {
      info: { name: 'Com tam' },
      owner_id: user.id,
    };
    const data = await prisma.recipes.create({
      data: recipe,
    });
    const path = 'images/com-tam-s5p4b4s3.avif';
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: jest.fn().mockResolvedValue({
        data: { path },
        error: null,
      }),
    });
    const image = await fs.readFile('test/test-image.jpeg');

    const result = await recipesService.uploadImage(
      data.owner_id,
      data.id,
      image as unknown as Express.Multer.File,
    );

    expect(result.info.image).toEqual(path);
  }, 10_000);

  it('should delete a recipe', async () => {
    const recipe = {
      info: { name: 'Com tam' },
      owner_id: user.id,
    };
    const data = await prisma.recipes.create({
      data: recipe,
    });

    const result = await recipesService.delete(data.owner_id, data.id);

    expect(result).toMatchObject(recipe);
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.users.delete({
        where: { id: user.id },
      }),
      prisma.recipes.deleteMany(),
    ]);
    await prisma.$disconnect();
  });
});
