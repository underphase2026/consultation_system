import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../domains/users/interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
