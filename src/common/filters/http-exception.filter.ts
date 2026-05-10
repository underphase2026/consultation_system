import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = '서버 내부 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exRes = exception.getResponse();

      if (typeof exRes === 'object' && exRes !== null) {
        const body = exRes as Record<string, unknown>;
        // class-validator 오류는 message가 배열
        const rawMessage = body['message'];
        code = (body['code'] as string) ?? this.statusToCode(status);
        message = Array.isArray(rawMessage)
          ? (rawMessage as string[]).join(', ')
          : ((rawMessage as string) ?? exception.message);
      } else {
        code = this.statusToCode(status);
        message = String(exRes);
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(status).json({
      success: false,
      error: { code, message },
    });
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      502: 'EXTERNAL_API_ERROR',
    };
    return map[status] ?? 'INTERNAL_ERROR';
  }
}
