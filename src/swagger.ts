import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Swagger UI su /docs, specifica OpenAPI su /docs-json
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('TicketHub')
    .setDescription('API della biglietteria TicketHub')
    .setVersion('0.0.1')
    .build();
  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, config));
}
