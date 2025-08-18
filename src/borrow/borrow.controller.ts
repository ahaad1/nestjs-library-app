// src/borrow/borrow.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BorrowService } from './borrow.service';
import { BorrowRequestDto } from './dto/borrow-request.dto';
import { ReturnRequestDto } from './dto/return-request.dto';

@ApiTags('Borrow')
@Controller()
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post('borrow')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Выдать книгу пользователю' })
  @ApiBody({ type: BorrowRequestDto })
  @ApiOkResponse({
    description: 'Книга выдана',
    schema: {
      example: {
        status: true,
        message: 'Книга выдана',
        data: {
          id: '0d8f0b1a-3a52-4b6e-8f8b-a2b1d9e3d123',
          userId: '7a1b1e3b-1c0a-4f3c-8f7e-1b2c3d4e5f67',
          bookId: '3d2c1b0a-9e8f-7d6c-5b4a-3210fedcba98',
          borrowDate: '2025-08-19T09:12:34.000Z',
          returnDate: null,
          createdAt: '2025-08-19T09:12:34.000Z',
          updatedAt: '2025-08-19T09:12:34.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Неверные данные или книга недоступна',
    schema: {
      example: {
        status: false,
        code: 400,
        message: 'Книга уже в аренде',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Книга не найдена',
    schema: {
      example: {
        status: false,
        code: 404,
        message: 'Книга с id=xxx не найдена',
      },
    },
  })
  async borrow(@Body() dto: BorrowRequestDto) {
    return this.borrowService.borrow(dto.userId, dto.bookId);
  }

  @Post('return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вернуть книгу по borrowId' })
  @ApiBody({ type: ReturnRequestDto })
  @ApiOkResponse({
    description: 'Книга возвращена',
    schema: {
      example: {
        status: true,
        message: 'Книга возвращена',
        data: {
          id: '0d8f0b1a-3a52-4b6e-8f8b-a2b1d9e3d123',
          userId: '7a1b1e3b-1c0a-4f3c-8f7e-1b2c3d4e5f67',
          bookId: '3d2c1b0a-9e8f-7d6c-5b4a-3210fedcba98',
          borrowDate: '2025-08-19T09:12:34.000Z',
          returnDate: '2025-08-19T12:00:01.000Z',
          createdAt: '2025-08-19T09:12:34.000Z',
          updatedAt: '2025-08-19T12:00:01.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Неверные данные или аренда уже закрыта',
    schema: {
      example: {
        status: false,
        code: 400,
        message: 'Эта аренда уже закрыта (книга возвращена)',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Аренда не найдена',
    schema: {
      example: {
        status: false,
        code: 404,
        message: 'Аренда с id=xxx не найдена',
      },
    },
  })
  async return(@Body() dto: ReturnRequestDto) {
    return this.borrowService.return_borrow(dto.borrowId);
  }

  @Get('borrowed')
  @ApiOperation({ summary: 'Список активных аренд (книги сейчас в аренде)' })
  @ApiOkResponse({
    description: 'Список аренд',
    schema: {
      example: {
        status: true,
        count: 1,
        data: [
          {
            id: '0d8f0b1a-3a52-4b6e-8f8b-a2b1d9e3d123',
            userId: '7a1b1e3b-1c0a-4f3c-8f7e-1b2c3d4e5f67',
            bookId: '3d2c1b0a-9e8f-7d6c-5b4a-3210fedcba98',
            borrowDate: '2025-08-19T09:12:34.000Z',
            returnDate: null,
            book: {
              id: '3d2c1b0a-9e8f-7d6c-5b4a-3210fedcba98',
              title: 'Clean Code',
              author: 'Robert C. Martin',
              isAvailable: false,
            },
            user: {
              id: '7a1b1e3b-1c0a-4f3c-8f7e-1b2c3d4e5f67',
              name: 'Alice',
              email: 'alice@example.com',
            },
          },
        ],
      },
    },
  })
  async listBorrowed() {
    return this.borrowService.listBorrowed();
  }

  // ===
  @Get('users/:id/history')
  @ApiOperation({ summary: 'История аренд пользователя' })
  @ApiOkResponse({
    description: 'История аренд',
    schema: {
      example: {
        status: true,
        count: 2,
        data: [
          {
            id: '...',
            bookId: '...',
            borrowDate: '...',
            returnDate: '...',
            book: { id: '...', title: '...' },
          },
        ],
      },
    },
  })
  async userHistory(@Param('id', new ParseUUIDPipe()) userId: string) {
    return this.borrowService.userHistory(userId);
  }
}
