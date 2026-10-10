import 'reflect-metadata';
import compression from 'compression';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { AppConfigService } from './core/config/app-config.service.js';
import { LoggerService } from './core/logger/logger.service.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
    bodyParser: true,
  });

  const config = app.get(AppConfigService);
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  // Cabeceras de seguridad. La CSP se deja `false` porque Swagger UI inyecta
  // scripts inline; la política de contenido real la aplica la web pública.
  app.use(
    helmet({
      contentSecurityPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Detrás del túnel (y de reverse proxies) para que la IP real llegue al
  // rate limiting y a las cookies `Secure` del proxy.
  app.set('trust proxy', 1);

  app.use(compression());

  app.enableCors({
    origin: config.app.corsOrigins,
    credentials: true,
  });

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('JC Autoimport API')
    .setDescription('Backend API for the JC Autoimport vehicle sales platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: true,
  });
  SwaggerModule.setup('api/docs', app, document);

  const port = config.app.port;
  // 127.0.0.1 keeps the API off the network; 0.0.0.0 is needed to reach it from
  // a phone on the same wifi. The public tunnel only ever points at the web.
  const host = config.app.host;
  await app.listen(port, host);
  logger.log(`JC Autoimport backend running on http://${host}:${port}/api/v1`, 'Bootstrap');
}

await bootstrap();