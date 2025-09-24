import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsersEntity } from 'src/entities/users.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UsersEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
