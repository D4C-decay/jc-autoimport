import 'reflect-metadata';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const method = req?.method as string;
    const isMutation = method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE';
    if (!isMutation || !req) {
      return next.handle();
    }

    const userId =
      req.user && typeof req.user === 'object' && 'sub' in req.user
        ? (req.user as { sub: string }).sub
        : undefined;
    const entity = this.inferEntityFromPath(req.path);
    const isCreate = method === 'POST';
    const entityId = this.inferEntityId(req.params, isCreate);
    const action = `${method} ${req.path}`;

    // Fire-and-forget: audit must not block the response path.
    void this.writeAudit({
      userId,
      action,
      entity,
      entityId,
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'] as string | undefined,
      oldValues: isCreate ? undefined : { capturedEntityId: entityId },
      newValues: { body: this.sanitizeBody(req.body) },
    });

    return next.handle();
  }

  private inferEntityFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);
    const last = segments.pop();
    if (last && this.isIdLike(last)) {
      return segments.pop() ?? 'unknown';
    }
    return last ?? 'unknown';
  }

  private inferEntityId(params: Record<string, string>, isCreate: boolean): string | undefined {
    if (isCreate) return undefined;
    const entries = Object.entries(params ?? {});
    const idEntry = entries.find(
      ([k, v]) => (k === 'id' || k.endsWith('Id')) && this.isIdLike(v),
    );
    return idEntry?.[1];
  }

  private isIdLike(value: string): boolean {
    return /^[a-z0-9]{20,64}$/i.test(value) || /^[a-f0-9]{8}-[a-f0-9-]{4}-[a-f0-9-]{4}-[a-f0-9-]{4}-[a-f0-9-]{12}$/i.test(value);
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;
    const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) };
    for (const key of ['password', 'passwordHash', 'currentPassword', 'token', 'refreshToken', 'secret']) {
      if (key in clone) clone[key] = '[REDACTED]';
    }
    return clone;
  }

  private async writeAudit(entry: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    oldValues?: unknown;
    newValues?: unknown;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          entity: entry.entity,
          entityId: entry.entityId ?? 'unknown',
          ...(entry.oldValues ? { oldValues: entry.oldValues } : {}),
          ...(entry.newValues ? { newValues: entry.newValues } : {}),
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log: ${(error as Error).message}`);
    }
  }
}