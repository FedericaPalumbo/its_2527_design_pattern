import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupSwagger } from '../src/swagger';

describe('Documentazione OpenAPI', () => {
  let app: INestApplication;
  let doc: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupSwagger(app);
    await app.init();
    const res = await request(app.getHttpServer()).get('/docs-json').expect(200);
    doc = res.body;
  });

  afterAll(async () => {
    await app.close();
  });

  it('serve la Swagger UI su /docs', () => {
    return request(app.getHttpServer())
      .get('/docs')
      .expect(200)
      .expect('Content-Type', /html/);
  });

  it('elenca le rotte dei controller', () => {
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining(['/health', '/events', '/orders', '/gates/{gate}/scan', '/imports/promoter-a']),
    );
  });

  it("descrive il body di un ordine con i suoi campi", () => {
    const body = doc.paths['/orders'].post.requestBody.content['application/json'].schema;
    expect(body.$ref).toBe('#/components/schemas/CreateOrderDto');
    const schema = doc.components.schemas.CreateOrderDto;
    expect(schema.required).toEqual(expect.arrayContaining(['eventId', 'seats', 'card', 'holderName']));
    expect(schema.properties.seats.type).toBe('array');
  });

  it.each([
    ['/gates/{gate}/scan', 'ScanDto'],
    ['/imports/promoter-a', 'ImportFeedDto'],
    ['/imports/promoter-b', 'ImportFeedDto'],
    ['/payments/alpha/webhook', 'AlphaWebhookDto'],
  ])('descrive il body di %s con %s', (path, dto) => {
    const body = doc.paths[path].post.requestBody.content['application/json'].schema;
    expect(body.$ref).toBe(`#/components/schemas/${dto}`);
    expect(Object.keys(doc.components.schemas[dto].properties).length).toBeGreaterThan(0);
  });
});
