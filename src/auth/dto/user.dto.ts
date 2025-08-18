import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserDto {
  @ApiProperty({ default: 'uuid пользователя' })
  @IsUUID()
  id: string;

  @ApiProperty({ default: 'имя пользователя' })
  @IsString()
  name: string;

  @ApiProperty({ default: 'почта пользователя' })
  @IsEmail()
  email: string;

  @IsOptional()
  token?: any;
}
