import { Controller, Get, HttpStatus, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { UserService } from './user/user.service';
import { Public } from './auth/guards/public.guard';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

const AUTH_LOGIN_SCHEMA: SchemaObject = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      example: 'user'
    },
    password: {
      type: 'string',
      example: 'password'
    },
  },
};

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login', tags: ['auth'] })
  @ApiBody({ schema: AUTH_LOGIN_SCHEMA })
  @Post('auth/login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { token } = await this.authService.login(req.user);
    res.cookie('auth_cookie', { token }, { httpOnly: true });
    res.status(HttpStatus.CREATED);

    return 'Authorized';
  }

  @ApiOperation({ summary: 'Profile', tags: ['profile'] })
  @Get('profile')
  async getProfile(@Request() req) {
    const { password, ...result } = await this.userService.findUnique(req.user.id);
    return result;
  }
}
