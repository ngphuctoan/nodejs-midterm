import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaClient>(),
        },
      ],
    }).compile();

    usersService = module.get(UsersService);
    prisma = module.get(PrismaService);
  });

  it('should find user by email', async () => {
    const user = { email: 'meep@remun.ch' } as Prisma.usersModel;
    prisma.users.findUnique.mockResolvedValue(user);

    const result = await usersService.findByEmail('meep@remun.ch');

    expect(result).toEqual(user);
  });

  it('should return null if user not found', async () => {
    prisma.users.findUnique.mockResolvedValue(null);

    const result = await usersService.findByEmail('meeb@remun.ch');

    expect(result).toEqual(null);
  });

  it('should create new user', async () => {
    const user = {
      name: 'Meep',
      email: 'meep@remun.ch',
      password_hash: 'm33pm33p',
    } as Prisma.usersModel;
    prisma.users.create.mockResolvedValue(user);

    const result = await usersService.create({
      name: 'Meep',
      email: 'meep@remun.ch',
      password: 'meepmeep',
    });

    expect(result).toEqual(user);
  });
});
