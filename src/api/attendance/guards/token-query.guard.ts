import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TokenQueryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.query.token;

    // If token is provided as query parameter, set it in the Authorization header
    if (token && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return true; // Always allow, just set the header
  }
}
