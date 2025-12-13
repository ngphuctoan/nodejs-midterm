import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '../generated/prisma/client';

describe('UsersService (Integration)', () => {
  let usersService: UsersService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    usersService = module.get(UsersService);
    prisma = module.get(PrismaService);
  });

  it('should find user by email', async () => {
    const user = await prisma.users.create({
      data: {
        name: 'Demo',
        email: 'demo@remun.ch',
        password_hash: '123456',
      },
    });

    const result = await usersService.findByEmail('demo@remun.ch');

    expect(result).toMatchObject(user);

    await prisma.users.delete({
      where: { id: user.id },
    });
  });

  it('should create new user', async () => {
    const user = await usersService.create({
      name: 'Demo',
      email: 'demo@remun.ch',
      password: '123456',
    });

    expect(user).toMatchObject({
      name: 'Demo',
      email: 'demo@remun.ch',
    });
    expect(user.password_hash).not.toEqual('123456');

    await prisma.users.delete({
      where: { id: user.id },
    });
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });
});
