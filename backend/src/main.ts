import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogLevel } from '@nestjs/common';

async function bootstrap() {
  // Determine log levels from environment
  const logLevels = (process.env.LOG_LEVEL?.split(',') as LogLevel[]) || ['log', 'error', 'warn'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
  });

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
