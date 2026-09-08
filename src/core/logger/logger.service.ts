import 'reflect-metadata';
import { Global, Injectable, type LoggerService as NestLoggerService, type LogLevel } from '@nestjs/common';
import pino, { type Logger as PinoLogger, type LoggerOptions } from 'pino';

@Global()
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: PinoLogger;

  constructor() {
    const base: LoggerOptions = {
      level: process.env.LOG_LEVEL ?? 'info',
      base: {
        service: process.env.APP_NAME ?? 'jc-autoimport-backend',
        env: process.env.NODE_ENV ?? 'development',
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: [
          'password',
          'passwordHash',
          '*.password',
          'token',
          'accessToken',
          'refreshToken',
          'authorization',
          'req.headers.authorization',
          'res.headers["set-cookie"]',
        ],
        censor: '[REDACTED]',
      },
    };

    this.logger = pino(base);
  }

  child(bindings: Record<string, unknown>): PinoLogger {
    return this.logger.child(bindings);
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.info(message as string, ...(optionalParams as never[]));
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.error(message as string, ...(optionalParams as never[]));
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.warn(message as string, ...(optionalParams as never[]));
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.debug(message as string, ...(optionalParams as never[]));
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.trace(message as string, ...(optionalParams as never[]));
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.fatal(message as string, ...(optionalParams as never[]));
  }

  setLogLevels(levels: LogLevel[]): void {
    const levelMap: Record<LogLevel, PinoLogger['level']> = {
      log: 'info',
      error: 'error',
      warn: 'warn',
      debug: 'debug',
      verbose: 'trace',
      fatal: 'fatal',
    };
    const highest = levels[0];
    if (highest) {
      this.logger.level = levelMap[highest] ?? 'info';
    }
  }
}