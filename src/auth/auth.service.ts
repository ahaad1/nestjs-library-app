import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { GeneralInnerResponse, generalResponse } from 'utils/response';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDto | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...rest } = user;
      return rest;
    }
    return null;
  }

  async login(user: UserDto): Promise<GeneralInnerResponse<UserDto>> {
    try {
      const token = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });

      return generalResponse(
        HttpStatus.OK,
        { token },
        'Authorization successful',
      );
    } catch (error) {
      throw new HttpException(
        { status: false, code: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async register(dto: RegisterUserDto): Promise<GeneralInnerResponse<UserDto>> {
    try {
      const exists = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });
      if (exists) {
        throw new ConflictException('Email already registered');
      }

      const hashed = await bcrypt.hash(dto.password, 10);

      const user = await this.prismaService.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashed,
        },
        omit: {
          password: true,
        },
      });

      const token = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });

      return generalResponse(
        HttpStatus.CREATED,
        {
          user,
          token,
        },
        'Registration successful',
      );
    } catch (error) {
      throw new HttpException(
        { status: false, code: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async logout(res: Response) {
    try {
      return generalResponse(HttpStatus.OK, null, 'Logout successful');
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
