import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { Prisma, PrismaClient } from '../src/generated/prisma/client';
import { PrismaService } from '../src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SupabaseClient } from '@supabase/supabase-js';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { SUPABASE } from '../src/storage/storage.provider';
import bcrypt from 'bcrypt';

describe('AppController', () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let jwtService: JwtService;
  let user: Prisma.usersModel;
  let accessToken: string;
  let supabase: DeepMockProxy<SupabaseClient>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE)
      .useValue(mockDeep<SupabaseClient>())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    supabase = app.get(SUPABASE);

    const passwordHash = await bcrypt.hash('bandana', 10);
    user = await prisma.users.upsert({
      where: { email: 'waddle_dee@remun.ch' },
      update: {},
      create: {
        name: 'Waddle Dee',
        email: 'waddle_dee@remun.ch',
        password_hash: passwordHash,
      },
    });
    accessToken = jwtService.sign({
      sub: user.id,
      name: user.name,
      email: user.email,
    });
  });

  describe('AuthController', () => {
    it('[POST] /auth/register', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Marx',
          email: 'marx@remun.ch',
          password: 'well_i_want_to_control_popstar',
        })
        .expect(201);

      expect(res.body).toMatchObject({
        name: 'Marx',
        email: 'marx@remun.ch',
      });
      expect(res.body).not.toHaveProperty('password_hash');
    });

    it('[POST] /auth/login', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'waddle_dee@remun.ch',
          password: 'bandana',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
    });

    it('[GET] /auth/me', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Waddle Dee',
        email: 'waddle_dee@remun.ch',
      });
    });
  });

  describe('RecipesController', () => {
    it('[GET] /recipes', async () => {
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

      const res = await request(app.getHttpServer())
        .get('/recipes')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject(recipes);
    });

    it('[GET] /recipes/:id', async () => {
      const recipe = {
        info: { name: 'Com tam' },
        owner_id: user.id,
      };
      const data = await prisma.recipes.create({
        data: recipe,
      });

      const res = await request(app.getHttpServer())
        .get(`/recipes/${data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject(recipe);
    });

    it('[GET] /recipes/:id/image', async () => {
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

      const res = await request(app.getHttpServer())
        .get(`/recipes/${data.id}/image`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.text).toEqual('supabase_is_awesome!');
    });

    it('[POST] /recipes', async () => {
      const recipe = {
        info: { name: 'Com tam' },
      };

      const res = await request(app.getHttpServer())
        .post('/recipes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(recipe)
        .expect(201);

      expect(res.body).toMatchObject(recipe);
    });

    it('[PATCH] /recipes/:id', async () => {
      const recipe = {
        info: { name: 'Com tam' },
        owner_id: user.id,
      };
      const data = await prisma.recipes.create({
        data: recipe,
      });

      const res = await request(app.getHttpServer())
        .patch(`/recipes/${data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ is_done: true })
        .expect(200);

      expect(res.body).toMatchObject({
        info: { name: 'Com tam' },
        is_done: true,
      });
    });

    it('[POST] /recipes/:id/image', async () => {
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

      const res = await request(app.getHttpServer())
        .post(`/recipes/${data.id}/image`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('image', 'test/test-image.jpeg')
        .expect(201);

      expect(res.body).toMatchObject({
        info: { image: path },
      });
    });

    it('[DELETE] /recipes/:id', async () => {
      const recipe = {
        info: { name: 'Com tam' },
        owner_id: user.id,
      };
      const data = await prisma.recipes.create({
        data: recipe,
      });

      const res = await request(app.getHttpServer())
        .delete(`/recipes/${data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject(recipe);
    });
  });

  describe('SavedRecipesController', () => {
    it('[GET] /saved-recipes', async () => {
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

      const res = await request(app.getHttpServer())
        .get('/saved-recipes')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject(savedRecipes);
    });

    it('[GET] /saved-recipes/:id', async () => {
      const savedRecipe = {
        info: { name: 'Com tam' },
        owner_id: user.id,
      };
      const data = await prisma.saved_recipes.create({
        data: savedRecipe,
      });

      const res = await request(app.getHttpServer())
        .get(`/saved-recipes/${data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject(savedRecipe);
    });

    it('[GET] /saved-recipes/:id/image', async () => {
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

      const res = await request(app.getHttpServer())
        .get(`/saved-recipes/${data.id}/image`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.text).toEqual('supabase_is_awesome!');
    });

    it('[POST] /saved-recipes', async () => {
      const savedRecipe = {
        info: { name: 'Com tam' },
      };

      const res = await request(app.getHttpServer())
        .post('/saved-recipes')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(savedRecipe)
        .expect(201);

      expect(res.body).toMatchObject(savedRecipe);
    });

    it('[PATCH] /saved-recipes/:id', async () => {
      const savedRecipe = {
        info: { name: 'Com tam' },
        owner_id: user.id,
      };
      const data = await prisma.saved_recipes.create({
        data: savedRecipe,
      });

      const res = await request(app.getHttpServer())
        .patch(`/saved-recipes/${data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ info: { name: 'Com suon' } })
        .expect(200);

      expect(res.body).toMatchObject({
        info: { name: 'Com suon' },
      });
    });

    it('[POST] /saved-recipes/:id/image', async () => {
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

      const res = await request(app.getHttpServer())
        .post(`/saved-recipes/${data.id}/image`)
        .set('Authorization', `Bearer ${accessToken}`)
        .attach('image', 'test/test-image.jpeg')
        .expect(201);

      expect(res.body).toMatchObject({
        info: { image: path },
      });
    });

    it('[DELETE] /saved-recipes/:id', async () => {
      const savedRecipe = {
        info: { name: 'Com tam' },
        owner_id: user.id,
      };
      const data = await prisma.saved_recipes.create({
        data: savedRecipe,
      });

      const res = await request(app.getHttpServer())
        .delete(`/saved-recipes/${data.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject(savedRecipe);
    });
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.recipes.deleteMany(),
      prisma.saved_recipes.deleteMany(),
      prisma.users.deleteMany(),
    ]);
    await prisma.$disconnect();
    await app.close();
  });
});
