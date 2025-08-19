import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'common/decorators/public.decorator';
import { ClsService } from 'nestjs-cls';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly cls: ClsService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    this.logger.debug(`Endpoint is public: ${isPublic}`);
    if (isPublic) return true;
    const result = super.canActivate(context);
    this.logger.log('JWT AuthGuard activated successfully');
    return result;
  }

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      this.logger.warn('Unauthorized access attempt or no user found');
      throw err || new UnauthorizedException();
    }

    this.cls.set('userId', user.id);
    this.logger.log(`UserId ${user.id} set in CLS context`);
    return user;
  }
}
