import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

describe('Catalog & search (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/vehicles lists published vehicles with cursor pagination', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/vehicles?limit=2')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.data)).toBe(true);
        expect(res.body.data.data.length).toBeGreaterThan(0);
        expect(res.body.data.data[0]).toHaveProperty('primaryImageUrl');
        expect(res.body.data).toHaveProperty('meta.nextCursor');
      });
  });

  it('GET /api/v1/search?q=rav4 finds Toyota RAV4 units', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/search?q=rav4')
      .expect(200)
      .expect((res) => {
        const matches = res.body.data.data.filter(
          (d: { brand: string; model: string }) =>
            d.brand.toLowerCase() === 'toyota' && d.model.toLowerCase().includes('rav4'),
        );
        expect(matches.length).toBeGreaterThan(0);
        expect(res.body.data.data[0]).toHaveProperty('primaryImage');
      });
  });

  it('register -> login -> GET /users/me flows end to end', async () => {
    const email = `e2e-${Date.now()}@jcautoimport.com`;
    const password = 'StrongPass123!';

    const reg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password, firstName: 'E2E', lastName: 'Tester' })
      .expect(201);

    expect(reg.body.data.user.email).toBe(email);
    expect(typeof reg.body.data.tokens.accessToken).toBe('string');

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    const token = login.body.data.tokens.accessToken;
    expect(typeof token).toBe('string');

    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .auth(token, { type: 'bearer' })
      .expect(200)
      .expect((res) => expect(res.body.data.email).toBe(email));
  });
});