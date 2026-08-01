import 'tsconfig-paths/register';   // add this at the very top
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException,HttpStatus } from '@nestjs/common'
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(), // or new FastifyAdapter({ logger: true })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strip properties not in DTO
      forbidNonWhitelisted: true,   // Throw error if extra properties
      transform: true,              // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true  // Convert types (string -> number)
      },
      stopAtFirstError: false,      // Report all errors (not just first)
      skipMissingProperties: false, // Validate even if properties missing
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    })
  );
  // Global Response Interceptor (Success Response এর জন্য)
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Exception Filter (Error Response এর জন্য)
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
  // For external access: await app.listen(3000, '0.0.0.0');
}
bootstrap();