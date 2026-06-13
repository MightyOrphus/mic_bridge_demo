import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Requirement for Angular frontend on different port
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
