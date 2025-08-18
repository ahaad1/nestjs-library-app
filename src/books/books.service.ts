import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeneralInnerResponse, generalResponse } from 'utils/response';
import { Book } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createBookDto: CreateBookDto,
  ): Promise<GeneralInnerResponse<Book>> {
    try {
      const book = await this.prismaService.book.create({
        data: createBookDto,
      });
      return generalResponse(
        HttpStatus.CREATED,
        book,
        'новая книга успешло создана',
      );
    } catch (error) {
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
      return generalResponse(
        HttpStatus.OK,
        allBooks,
        'список всех найденных книг',
      );
    } catch (error) {
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
      return generalResponse(HttpStatus.OK, book, 'книга успешно найдена');
    } catch (error) {
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
      return generalResponse(HttpStatus.OK, book, 'книга успешно обновлена');
    } catch (error) {
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
      return generalResponse(HttpStatus.OK, {}, 'книга успешно удалена');
    } catch (error) {
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
