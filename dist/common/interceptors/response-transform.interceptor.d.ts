import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class ResponseTransformInterceptor<T> implements NestInterceptor<T, {
    success: boolean;
    data: T;
}> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<{
        success: boolean;
        data: T;
    }>;
}
