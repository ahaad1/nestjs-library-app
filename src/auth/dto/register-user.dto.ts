import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ default: 'имя пользователя' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 256)
  name: string;

  @ApiProperty({ default: 'почта пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({
    default:
      'пароль пользователя. минимальная 6. максимальная длина 128 символов.',
  })
  @IsStrongPassword()
  @Length(8, 128)
  password: string;
}
