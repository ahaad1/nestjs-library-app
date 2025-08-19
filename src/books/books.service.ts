import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeneralInnerResponse, generalResponse } from 'utils/response';
import { Book } from '@prisma/client';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createBookDto: CreateBookDto,
  ): Promise<GeneralInnerResponse<Book>> {
    try {
      const book = await this.prismaService.book.create({
        data: createBookDto,
      });
      this.logger.log(`Book created with ID: ${book.id}`);
      return generalResponse(
        HttpStatus.CREATED,
        book,
        'новая книга успешло создана',
      );
    } catch (error) {
      this.logger.error(`Failed to create book: ${error.message}`, error.stack);
      throw new HttpException(
        {
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(): Promise<GeneralInnerResponse<Array<Book>>> {
    try {
      const allBooks = await this.prismaService.book.findMany({
        include: { borrows: true },
      });
      this.logger.log(`Retrieved all books, count: ${allBooks.length}`);
      return generalResponse(
        HttpStatus.OK,
        allBooks,
        'список всех найденных книг',
      );
    } catch (error) {
      this.logger.error(`Failed to retrieve books: ${error.message}`, error.stack);
      throw new HttpException(
        {
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string): Promise<GeneralInnerResponse<Book>> {
    try {
      const book = await this.prismaService.book.findUnique({
        where: {
          id,
        },
      });
      this.logger.log(`Book found with ID: ${id}`);
      return generalResponse(HttpStatus.OK, book, 'книга успешно найдена');
    } catch (error) {
      this.logger.error(`Failed to find book with ID ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        {
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
  ): Promise<GeneralInnerResponse<Book>> {
    try {
      const book = await this.prismaService.book.update({
        where: { id },
        data: updateBookDto,
      });
      this.logger.log(`Book updated with ID: ${id}`);
      return generalResponse(HttpStatus.OK, book, 'книга успешно обновлена');
    } catch (error) {
      this.logger.error(`Failed to update book with ID ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        {
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string): Promise<GeneralInnerResponse<{}>> {
    try {
      await this.prismaService.book.delete({
        where: { id },
      });
      this.logger.log(`Book deleted with ID: ${id}`);
      return generalResponse(HttpStatus.OK, {}, 'книга успешно удалена');
    } catch (error) {
      this.logger.error(`Failed to delete book with ID ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        {
          status: false,
          code: HttpStatus.BAD_REQUEST,
          message: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
