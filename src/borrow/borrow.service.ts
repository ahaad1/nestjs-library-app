import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Borrow } from '@prisma/client';
import { BooksService } from 'src/books/books.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GeneralInnerResponse, generalResponse } from 'utils/response';

@Injectable()
export class BorrowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bookService: BooksService,
  ) {}

  async borrow(
    userId: string,
    bookId: string,
  ): Promise<GeneralInnerResponse<Borrow>> {
    try {
      const book = (await this.bookService.findOne(bookId)).data;
      if (!book) {
        throw new NotFoundException(`книга с id ${bookId} не найдена`);
      }
      if (!book.isAvaliable) {
        throw new Error(`Книга с id ${bookId} не доступна`);
      }

      const borrow = await this.prismaService.$transaction(async (tx) => {
        await tx.book.update({
          where: { id: bookId },
          data: { isAvaliable: false },
        });

        return await tx.borrow.create({
          data: {
            bookId,
            userId,
          },
          include: {
            user: {
              omit: {
                password: true,
              },
            },
            book: true,
          },
        });
      });
      return generalResponse(
        HttpStatus.CREATED,
        borrow,
        'книжка успешно выдана',
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

  async return_borrow(borrowId: string): Promise<GeneralInnerResponse<Borrow>> {
    try {
      const borrow = await this.prismaService.borrow.findUnique({
        where: { id: borrowId },
      });

      if (!borrow) {
        throw new NotFoundException(`аренда с id ${borrowId} не найдена`);
      }
      if (borrow.returnDate) {
        throw new BadRequestException(
          `аренда уже закрыта. книжка возвращена ${borrow.returnDate}`,
        );
      }

      const closed_borrow = await this.prismaService.$transaction(
        async (tx) => {
          await tx.book.update({
            where: { id: borrow.bookId },
            data: { isAvaliable: true },
          });

          return await tx.borrow.update({
            where: { id: borrowId },
            data: { returnDate: new Date() },
          });
        },
      );

      return generalResponse(
        HttpStatus.OK,
        closed_borrow,
        'книжка успешно возвращена',
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

  async listBorrowed(): Promise<GeneralInnerResponse<Array<Borrow>>> {
    try {
      const borrowed = await this.prismaService.borrow.findMany({
        where: { returnDate: null },
        orderBy: { borrowDate: 'desc' },
        include: {
          user: {
            omit: {
              password: true,
            },
          },
          book: true,
        },
      });
      return generalResponse(
        HttpStatus.OK,
        borrowed,
        'все не возвращенные книги',
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

  //====бонуска
  async userHistory(
    userId: string,
  ): Promise<GeneralInnerResponse<Array<Borrow>>> {
    try {
      const history = await this.prismaService.borrow.findMany({
        where: { userId },
        orderBy: { borrowDate: 'desc' },
        include: { book: true },
      });
      return generalResponse(
        HttpStatus.OK,
        history,
        'история пользователя'
      )
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
