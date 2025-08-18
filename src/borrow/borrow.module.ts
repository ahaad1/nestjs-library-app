import { Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { BooksModule } from 'src/books/books.module';

@Module({
  controllers: [BorrowController],
  providers: [BorrowService],
  imports: [BooksModule],
})
export class BorrowModule {}
