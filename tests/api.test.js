const request = require('supertest');
const app = require('../src/server');

describe('JSON Validator API Endpoints', () => {
  describe('GET /api/health', () => {
    test('returns healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('POST /api/validate', () => {
    test('validates valid JSON', async () => {
      const res = await request(app)
        .post('/api/validate')
        .send({ json: '{"key": "value"}' });
      expect(res.statusCode).toBe(200);
      expect(res.body.result.valid).toBe(true);
    });

    test('returns error for invalid JSON syntax', async () => {
      const res = await request(app)
        .post('/api/validate')
        .send({ json: '{bad: json}' });
      expect(res.statusCode).toBe(200);
      expect(res.body.result.valid).toBe(false);
    });

    test('returns 400 for missing body', async () => {
      const res = await request(app)
        .post('/api/validate')
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/validate-schema', () => {
    test('validates data conforming to schema', async () => {
      const schema = JSON.stringify({ type: 'number' });
      const res = await request(app)
        .post('/api/validate-schema')
        .send({ json: '42', schema });
      expect(res.statusCode).toBe(200);
      expect(res.body.result.valid).toBe(true);
    });

    test('returns 400 when schema missing', async () => {
      const res = await request(app)
        .post('/api/validate-schema')
        .send({ json: '42' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/format', () => {
    test('prettifies JSON', async () => {
      const res = await request(app)
        .post('/api/format')
        .send({ json: '{"a":1}', action: 'prettify' });
      expect(res.statusCode).toBe(200);
      expect(res.body.result).toContain('\n');
    });

    test('minifies JSON', async () => {
      const res = await request(app)
        .post('/api/format')
        .send({ json: '{\n  "a": 1\n}', action: 'minify' });
      expect(res.statusCode).toBe(200);
      expect(res.body.result).toBe('{"a":1}');
    });
  });

  describe('POST /api/compare', () => {
    test('compares two JSON strings', async () => {
      const res = await request(app)
        .post('/api/compare')
        .send({ json1: '{"a":1}', json2: '{"a":2}' });
      expect(res.statusCode).toBe(200);
      expect(res.body.result.identical).toBe(false);
      expect(res.body.result.differences.length).toBe(1);
    });
  });

  describe('POST /api/info', () => {
    test('returns metadata of JSON document', async () => {
      const res = await request(app)
        .post('/api/info')
        .send({ json: '{"a":1,"b":2}' });
      expect(res.statusCode).toBe(200);
      expect(res.body.result.type).toBe('object');
      expect(res.body.result.keys).toEqual(['a', 'b']);
    });
  });
});
