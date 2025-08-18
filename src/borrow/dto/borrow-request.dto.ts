import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BorrowRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  bookId: string;
}
