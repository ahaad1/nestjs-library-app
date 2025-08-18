import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ default: 'почта пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'пароль пользователя. минимальная 6. максимальная длина 128 символов.' })
  @IsStrongPassword()
  @Length(8, 128)
  @IsString()
  password: string;
}
