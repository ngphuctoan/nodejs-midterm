import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });
    return user;
  }

  async create(data: CreateUserDto) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.users.create({
      data: {
        name: data.name,
        email: data.email,
        password_hash: passwordHash,
      },
    });
    return user;
  }
}
