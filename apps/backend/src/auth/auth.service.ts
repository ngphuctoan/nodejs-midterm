import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }
    const user = await this.usersService.create(data);
    const { password_hash, ...result } = user;
    return result;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return null;
    }
    const { password_hash, ...result } = user;
    return result;
  }

  login(
    user: Prisma.usersGetPayload<{
      select: { id: true; name: true; email: true };
    }>,
  ) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
