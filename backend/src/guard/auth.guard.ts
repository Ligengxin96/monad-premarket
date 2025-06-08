import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';


@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const contextType = context.getType<'http' | 'rmq'>();
    if (contextType === 'rmq') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const useraddress = request.headers.useraddress;
    if (!useraddress) {
      throw new ForbiddenException();
    } else {
      request.headers.useraddress = useraddress.toLowerCase();
      return true;
    }
  }
}
