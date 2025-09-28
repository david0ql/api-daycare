import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TokenQueryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const token = request.query.token;

    console.log('TokenQueryInterceptor - Token from query:', token);
    console.log('TokenQueryInterceptor - Current authorization header:', request.headers.authorization);

    // If token is provided as query parameter, set it in the Authorization header
    if (token && !request.headers.authorization) {
      request.headers.authorization = `Bearer ${token}`;
      console.log('TokenQueryInterceptor - Set authorization header:', request.headers.authorization);
    }

    return next.handle();
  }
}
