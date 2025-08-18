import { IsUUID } from 'class-validator';
import { ApiBody, ApiProperty } from '@nestjs/swagger';

export class ReturnRequestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  borrowId: string;
}
