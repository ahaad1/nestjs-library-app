import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly cfg: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    this.logger.debug(`Validating JWT payload for userId: ${payload.sub}`);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      omit: { password: true },
    });

    if (!user) {
      this.logger.warn(`User not found for userId: ${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }
    this.logger.log(`User validated successfully for userId: ${payload.sub}`);
    return user;
  }
}
