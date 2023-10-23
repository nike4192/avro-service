import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@mail.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(8)
  password: string;
}