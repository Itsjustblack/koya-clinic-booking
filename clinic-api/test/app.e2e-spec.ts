import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('API authentication (e2e)', () => {
  let app: INestApplication<App>;
  let apiKey: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    apiKey = app.get(ConfigService).getOrThrow<string>('API_KEY');
  });

  it('rejects a request without an API key', () => {
    return request(app.getHttpServer()).get('/slots').expect(401);
  });

  it('allows a request with the API key', () => {
    return request(app.getHttpServer())
      .get('/slots')
      .set('X-API-Key', apiKey)
      .expect(200)
      .expect('Content-Type', /json/);
  });

  afterEach(async () => {
    await app.close();
  });
});
