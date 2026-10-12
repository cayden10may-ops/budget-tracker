let mockResult = { data: [], error: null };

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => {
    const chain = {
      select: () => chain,
      insert: () => chain,
      update: () => chain,
      delete: () => chain,
      eq: () => chain,
      order: () => chain,
      from: () => chain,
      then: (resolve) => resolve(mockResult),
    };
    return chain;
  }),
}));

const request = require('supertest');
const app = require('./index');

const AUTH = { Authorization: 'Bearer test-token' };

beforeEach(() => {
  mockResult = { data: [], error: null };
});

describe('Health check', () => {
  test('GET / returns 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });
});

describe('Authentication', () => {
  test('GET /api/expenses returns 401 without a token', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.status).toBe(401);
  });

  test('POST /api/expenses returns 401 without a token', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ amount: 10, category: 'Food' });
    expect(res.status).toBe(401);
  });

  test('DELETE /api/expenses/:id returns 401 without a token', async () => {
    const res = await request(app).delete('/api/expenses/1');
    expect(res.status).toBe(401);
  });
});

describe('Expenses API', () => {
  test('GET returns the list of expenses', async () => {
    mockResult = { data: [{ id: 1, amount: 50, category: 'Food' }], error: null };
    const res = await request(app).get('/api/expenses').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].category).toBe('Food');
  });

  test('POST creates an expense and returns 201', async () => {
    mockResult = { data: [{ id: 2, amount: 20, category: 'Transport' }], error: null };
    const res = await request(app)
      .post('/api/expenses')
      .set(AUTH)
      .send({ amount: 20, category: 'Transport' });
    expect(res.status).toBe(201);
    expect(res.body.category).toBe('Transport');
  });

  test('PUT returns 404 when the expense does not exist', async () => {
    mockResult = { data: [], error: null };
    const res = await request(app)
      .put('/api/expenses/999')
      .set(AUTH)
      .send({ amount: 5, category: 'Misc' });
    expect(res.status).toBe(404);
  });

  test('DELETE returns 204', async () => {
    const res = await request(app).delete('/api/expenses/1').set(AUTH);
    expect(res.status).toBe(204);
  });

  test('returns 500 when the database errors', async () => {
    mockResult = { data: null, error: { message: 'db down' } };
    const res = await request(app).get('/api/expenses').set(AUTH);
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('db down');
  });
});