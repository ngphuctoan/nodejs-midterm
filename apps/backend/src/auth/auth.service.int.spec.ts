import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { PrismaClient } from '../generated/prisma/client';

describe('AuthService (Integration)', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            global: true,
            secret: config.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '1d' },
          }),
        }),
      ],
      providers: [AuthService, UsersService, PrismaService],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    prisma = module.get(PrismaService);
  });

  it('should register', async () => {
    const user = await authService.register({
      name: 'Meep',
      email: 'meep@remun.ch',
      password: 'meepmeep',
    });

    expect(user).toMatchObject({
      name: 'Meep',
      email: 'meep@remun.ch',
    });
    expect(user).not.toHaveProperty('password_hash');

    await prisma.users.delete({
      where: { id: user.id },
    });
  });

  it('should validate user', async () => {
    const user = await usersService.create({
      name: 'Meep',
      email: 'meep@remun.ch',
      password: 'meepmeep',
    });

    const result = await authService.validateUser('meep@remun.ch', 'meepmeep');

    expect(result).toMatchObject({
      name: 'Meep',
      email: 'meep@remun.ch',
    });

    await prisma.users.delete({
      where: { id: user.id },
    });
  });

  it('should login', () => {
    const result = authService.login({
      id: 1,
      name: 'Meep',
      email: 'meep@remun.ch',
    });

    expect(result.accessToken).toBeDefined();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });
});
