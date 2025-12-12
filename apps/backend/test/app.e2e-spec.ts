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
