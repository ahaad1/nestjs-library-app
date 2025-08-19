import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiProperty()
  @IsNumber()
  publishedYear: number;

  @ApiProperty()
  @IsString()
  genre: string;

  @ApiProperty()
  @IsBoolean()
  isAvaliable: boolean;
}
