import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Swagger UI su http://localhost:${port}/docs`, 'Swagger');
}
bootstrap();
