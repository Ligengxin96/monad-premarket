import { createParamDecorator, ForbiddenException } from "@nestjs/common";
import { ExecutionContextHost } from "@nestjs/core/helpers/execution-context-host";

export const User: (requireAuth?: boolean) => ParameterDecorator = createParamDecorator<boolean, ExecutionContextHost>(
  (requireAuth = true, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const useraddress = request.headers.useraddress;

    if (requireAuth && !useraddress) {
      throw new ForbiddenException();
    } else {
      return useraddress.toLowerCase();
    }
  },
);