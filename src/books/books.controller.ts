import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Books')
@ApiBearerAuth('jwt')
@UseGuards(AuthGuard('jwt'))
@Controller('books')
export class BooksController {
  private readonly logger = new Logger(BooksController.name);

  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Добавить новую книгу' })
  @ApiBody({ type: CreateBookDto })
  @ApiCreatedResponse({
    description: 'Книга создана',
    schema: {
      example: {
        status: true,
        code: 201,
        message: 'новая книга успешло создана',
        data: {
          id: 'a3f2b11e-2f0a-4b6f-8b7a-5f6c7d8e9f10',
          title: 'Clean Code',
          author: 'Robert C. Martin',
          publishedYear: 2008,
          genre: 'Programming',
          isAvailable: true,
          createdAt: '2025-08-19T10:11:12.000Z',
          updatedAt: '2025-08-19T10:11:12.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Неверные данные',
    schema: {
      example: { status: false, code: 400, message: 'Validation failed' },
    },
  })
  async create(@Body() dto: CreateBookDto) {
    this.logger.log(`Creating book with title: ${dto.title}`);
    return this.booksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Список всех книг (с активными арендами)' })
  @ApiOkResponse({
    description: 'Список книг',
    schema: {
      example: {
        status: true,
        code: 200,
        message: 'список всех найденных книг',
        data: [
          {
            id: 'a3f2b11e-2f0a-4b6f-8b7a-5f6c7d8e9f10',
            title: 'Clean Code',
            author: 'Robert C. Martin',
            publishedYear: 2008,
            genre: 'Programming',
            isAvailable: false,
            createdAt: '2025-08-19T10:11:12.000Z',
            updatedAt: '2025-08-19T10:11:12.000Z',
            borrows: [
              {
                id: 'b1c2d3e4-f5a6-4789-9abc-def012345678',
                userId: 'u-123',
                bookId: 'a3f2b11e-2f0a-4b6f-8b7a-5f6c7d8e9f10',
                borrowDate: '2025-08-19T11:00:00.000Z',
                returnDate: null,
                createdAt: '2025-08-19T11:00:00.000Z',
                updatedAt: '2025-08-19T11:00:00.000Z',
              },
            ],
          },
        ],
      },
    },
  })
  async findAll() {
    this.logger.log('Retrieving list of all books');
    return this.booksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить книгу по ID' })
  @ApiParam({ name: 'id', description: 'UUID книги', required: true })
  @ApiOkResponse({
    description: 'Книга найдена',
    schema: {
      example: {
        status: true,
        code: 200,
        message: 'книга успешно найдена',
        data: {
          id: 'a3f2b11e-2f0a-4b6f-8b7a-5f6c7d8e9f10',
          title: 'Clean Code',
          author: 'Robert C. Martin',
          publishedYear: 2008,
          genre: 'Programming',
          isAvailable: true,
          createdAt: '2025-08-19T10:11:12.000Z',
          updatedAt: '2025-08-19T10:11:12.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Ошибка поиска',
    schema: {
      example: { status: false, code: 400, message: 'Book not found' },
    },
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.log(`Retrieving book with id: ${id}`);
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить данные книги' })
  @ApiParam({ name: 'id', description: 'UUID книги', required: true })
  @ApiBody({ type: UpdateBookDto })
  @ApiOkResponse({
    description: 'Книга обновлена',
    schema: {
      example: {
        status: true,
        code: 200,
        message: 'книга успешно обновлена',
        data: {
          id: 'a3f2b11e-2f0a-4b6f-8b7a-5f6c7d8e9f10',
          title: 'Clean Code (2nd ed.)',
          author: 'Robert C. Martin',
          publishedYear: 2010,
          genre: 'Programming',
          isAvailable: true,
          createdAt: '2025-08-19T10:11:12.000Z',
          updatedAt: '2025-08-19T12:34:56.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Ошибка обновления',
    schema: {
      example: { status: false, code: 400, message: 'Validation failed' },
    },
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBookDto,
  ) {
    this.logger.log(`Updating book with id: ${id}`);
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить книгу' })
  @ApiParam({ name: 'id', description: 'UUID книги', required: true })
  @ApiOkResponse({
    description: 'Книга удалена',
    schema: {
      example: {
        status: true,
        code: 200,
        message: 'книга успешно удалена',
        data: {},
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Ошибка удаления',
    schema: { example: { status: false, code: 400, message: 'Delete failed' } },
  })
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    this.logger.log(`Removing book with id: ${id}`);
    return this.booksService.remove(id);
  }
}
