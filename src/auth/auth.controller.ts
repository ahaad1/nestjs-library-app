// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { Public } from '@prisma/client/runtime/library';
import { IsPublic } from 'common/decorators/public.decorator';

@IsPublic()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({
    description: 'Пользователь создан, выдан токен',
    schema: {
      example: {
        status: true,
        code: 201,
        message: 'Registration successful',
        data: {
          user: {
            id: 'c3e2f3a0-1b2c-4d5e-8f90-1234567890ab',
            name: 'Alice',
            email: 'alice@example.com',
            createdAt: '2025-08-19T12:00:00.000Z',
            updatedAt: '2025-08-19T12:00:00.000Z',
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email уже зарегистрирован',
    schema: {
      example: {
        status: false,
        code: 409,
        message: 'Email already registered',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Неверные данные',
    schema: {
      example: { status: false, code: 400, message: 'Validation failed' },
    },
  })
  async register(@Body() dto: RegisterUserDto) {
    this.logger.log(`Регистрация: ${dto.email}`);
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Логин пользователя' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Успешная авторизация, выдан токен',
    schema: {
      example: {
        status: true,
        code: 200,
        message: 'Authorization successful',
        data: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Неверный email или пароль',
    schema: {
      example: { status: false, code: 400, message: 'Invalid credentials' },
    },
  })
  async login(@Body() dto: LoginDto) {
    this.logger.log(`Логин: ${dto.email}`);
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new (class extends Error {
        public readonly message = 'Invalid credentials';
      })();
    }
    return this.authService.login(user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Логаут (статусный эндпоинт)' })
  @ApiOkResponse({
    description: 'Выход выполнен',
    schema: {
      example: {
        status: true,
        code: 200,
        message: 'Logout successful',
        data: null,
      },
    },
  })
  async logout() {
    this.logger.log('Логаут');
    return this.authService.logout(null as any);
  }
}
