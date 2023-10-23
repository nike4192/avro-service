import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { UserService } from "../user/user.service";
import { User } from '.prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<Omit<User, "password"> | null> {
    const user = await this.usersService.findOne(username);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, "password">) {
    const payload = { username: user.name, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
    }
  }

}
