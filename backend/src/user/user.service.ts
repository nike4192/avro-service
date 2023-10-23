import * as bcrypt from 'bcrypt';
import { User, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findFirst(where: Prisma.UserWhereInput) {
    return this.prisma.user.findFirst({
      where
    })
  }
  
  async findUnique(id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(13);
    const { password, ...data } = createUserDto;
    return this.prisma.user.create({
      data: {
        ...data,
        password: await bcrypt.hash(password, salt),
      }
    })
  }

  async findOne(username: string): Promise<User> {
    return this.prisma.user.findFirst({
      where: {
        name: username
      }
    })
  }
}
