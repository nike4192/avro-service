import { UserService } from './user.service';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/guards/public.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Public()  // TODO: Make for admin only
  @ApiOperation({ summary: 'Create user' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { email, name } = createUserDto;
    const alreadyExistsUser = await this.userService.findFirst({
      OR: [
        { email },
        { name }
      ]
    });

    if (alreadyExistsUser) {
      throw new BadRequestException('user with this email or name already exists')
    }

    const { password, ...data } = await this.userService.create(createUserDto);
    return data;
  }
}