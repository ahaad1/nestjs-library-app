import { APP_PIPE, NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TrimStringsPipe } from 'common/pipes/trim-string.pipe';
import * as cookieParser from 'cookie-parser';
import { EmptyStringToUndefinedPipe } from 'common/pipes/empty-string-to-undefined.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // app.enableCors();

  app.enableShutdownHooks();
  app.use(cookieParser());

  app.useGlobalPipes(
    new TrimStringsPipe(),
    new EmptyStringToUndefinedPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      transformOptions: {
        enableImplicitConversion: true,
      },

      exceptionFactory: (errors) => {
        const formatted = errors.map((e) => ({
          field: e.property,
          constraints: e.constraints,
        }));
        return new BadRequestException({
          message: 'validation failed',
          errors: formatted,
        });
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('Library assigment task by Ahad Askarov')
    .setDescription('nestjs + prisma demo')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'jwt',
    )
    .addSecurityRequirements('jwt')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const logger = new Logger('Bootstrap');

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  logger.log(`server runnung on http://localhost:${port}/api/v1`);
  logger.log(`swagger http://localhost:${port}/api/v1/docs`);
}
bootstrap();
