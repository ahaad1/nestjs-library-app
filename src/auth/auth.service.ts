import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { GeneralInnerResponse, generalResponse } from 'utils/response';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDto | null> {
    this.logger.debug(`Attempting to validate user with email: ${email}`);
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...rest } = user;
      return rest;
    }
    this.logger.warn(`Invalid credentials for email: ${email}`);
    return null;
  }

  async login(user: UserDto): Promise<GeneralInnerResponse<UserDto>> {
    try {
      const token = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });
      this.logger.log(`User logged in: ${user.email}`);
      return generalResponse(
        HttpStatus.OK,
        { token },
        'Authorization successful',
      );
    } catch (error) {
      this.logger.error(`Login error for user ${user.email}: ${error.message}`);
      throw new HttpException(
        { status: false, code: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async register(dto: RegisterUserDto): Promise<GeneralInnerResponse<UserDto>> {
    this.logger.log(`Starting registration for email: ${dto.email}`);
    try {
      const exists = await this.prismaService.user.findUnique({
        where: { email: dto.email },
      });
      if (exists) {
        this.logger.warn(`Email already registered: ${dto.email}`);
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

      this.logger.log(`Registration successful for email: ${dto.email}`);

      return generalResponse(
        HttpStatus.CREATED,
        {
          user,
          token,
        },
        'Registration successful',
      );
    } catch (error) {
      this.logger.error(`Registration error for email ${dto.email}: ${error.message}`);
      throw new HttpException(
        { status: false, code: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async logout(res: Response) {
    try {
      this.logger.log('User logged out successfully');
      return generalResponse(HttpStatus.OK, null, 'Logout successful');
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`);
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
