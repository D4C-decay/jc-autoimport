import 'reflect-metadata';
import compression from 'compression';
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
  await app.listen(port, '0.0.0.0');
  logger.log(`JC Autoimport backend running on http://localhost:${port}/api/v1`, 'Bootstrap');
}

await bootstrap();