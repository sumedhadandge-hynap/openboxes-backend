import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { API_PREFIX } from './common/constants/app.constant';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AppLoggerService } from './common/logger/app-logger.service';
import { LogCategory } from './common/logger/log-category.enum';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const appLogger = app.get(AppLoggerService);

  app.useLogger(app.get(Logger));
  app.use(helmet());

  app.enableCors({
    origin: configService.get<string>('app.corsOrigin') ?? true,
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX, {
    exclude: ['health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(app.get(HttpExceptionFilter));

  app.useGlobalInterceptors(
    app.get(LoggingInterceptor),
    app.get(ResponseInterceptor),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('OpenBoxes Supply Chain API')
    .setDescription('OpenBoxes Backend APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('api/docs', app, document);

  const port = configService.getOrThrow<number>('app.port');

  await app.listen(port);

  appLogger.info(
    LogCategory.APPLICATION,
    {
      event: 'application_started',
      port,
      nodeEnv: configService.get<string>('app.nodeEnv'),
    },
    `Server running on port ${port}`,
  );
}

void bootstrap();