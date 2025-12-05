import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { Prisma } from '../generated/prisma/client';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: DeepMockProxy<UsersService>;
  let jwtService: DeepMockProxy<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockDeep<UsersService>(),
        },
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should register', async () => {
    const user = {
      name: 'Meep',
      email: 'meep@remun.ch',
      password_hash: 'm33pm33p',
    } as Prisma.usersModel;
    usersService.findByEmail.mockResolvedValue(null);
    usersService.create.mockResolvedValue(user);

    const result = await authService.register({
      name: 'Meep',
      email: 'meep@remun.ch',
      password: 'meepmeep',
    });

    expect(result).toEqual({
      name: user.name,
      email: user.email,
    });
  });

  it('should throw if email is taken', async () => {
    const user = {
      name: 'Meep',
      email: 'meep@remun.ch',
      password_hash: 'm33pm33p',
    } as Prisma.usersModel;
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      authService.register({
        name: 'Meep',
        email: 'meep@remun.ch',
        password: 'meepmeep',
      }),
    ).rejects.toThrow('Email already exists');
  });

  it('should validate user', async () => {
    const user = {
      name: 'Meep',
      email: 'meep@remun.ch',
      password_hash: 'm33pm33p',
    } as Prisma.usersModel;
    usersService.findByEmail.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await authService.validateUser('meep@remun.ch', 'meepmeep');

    expect(result).toEqual({
      name: user.name,
      email: user.email,
    });
  });

  it('should return null if user not found', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    const result = await authService.validateUser('meeb@remun.ch', 'meebmeeb');

    expect(result).toEqual(null);
  });

  it('should return null if password not match', async () => {
    const user = {
      name: 'Meep',
      email: 'meep@remun.ch',
      password_hash: 'm33pm33p',
    } as Prisma.usersModel;
    usersService.findByEmail.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    const result = await authService.validateUser('meep@remun.ch', 'meebmeeb');

    expect(result).toEqual(null);
  });

  it('should login', () => {
    jwtService.sign.mockReturnValue('beepbeep');

    const result = authService.login({
      id: 1,
      name: 'Meep',
      email: 'meep@remun.ch',
    });

    expect(result).toEqual({ accessToken: 'beepbeep' });
  });
});
