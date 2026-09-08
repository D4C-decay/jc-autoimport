import 'reflect-metadata';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  path: string;
  method: string;
  timestamp: string;
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.extractMessage(exception, status);
    const error =
      exception instanceof HttpException ? this.extractError(exception) : 'Internal Server Error';

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponse = {
      statusCode: status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      ...(error ? { error } : {}),
    };

    response.status(status).json(body);
  }

  private extractMessage(exception: unknown, status: number): string | string[] {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'string') {
        return response;
      }
      if (response && typeof response === 'object') {
        const msg = (response as { message?: string | string[] }).message;
        if (msg) return msg;
        const error = (response as { error?: string }).error;
        if (error) return error;
      }
    }
    return status >= 500 ? 'Internal Server Error' : 'Request failed';
  }

  private extractError(exception: HttpException): string | undefined {
    const response = exception.getResponse();
    if (typeof response === 'object' && response !== null) {
      return (response as { error?: string }).error;
    }
    return undefined;
  }
}
