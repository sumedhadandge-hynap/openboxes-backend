import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface ResponsePayload<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T | ResponsePayload<T>,
  ResponsePayload<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T | ResponsePayload<T>>,
  ): Observable<ResponsePayload<T>> {
    const request = context
      .switchToHttp()
      .getRequest<{ path?: string; url?: string }>();
    if (request.path === '/health' || request.url === '/health') {
      return next.handle() as Observable<ResponsePayload<T>>;
    }

    return next.handle().pipe(
      map((response) => {
        if (response && typeof response === 'object' && 'success' in response) {
          return response;
        }

        const payload = response as ResponsePayload<T>;
        const hasEnvelope =
          payload &&
          typeof payload === 'object' &&
          ('message' in payload || 'data' in payload);

        return {
          success: true,
          message: hasEnvelope ? payload.message : 'Request successful',
          data: hasEnvelope ? payload.data : response,
        } as ResponsePayload<T>;
      }),
    );
  }
}
