import request from 'supertest';
import app, { server } from '../index';

describe('FinHub API E2E', () => {
  let token = '';

  afterAll((done) => {
    server.close(done);
  });

  describe('1. Auth Routes', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@finhub.com',
        name: 'User Test',
        password: 'password123'
      });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('test@finhub.com');
    });

    it('should login and get JWT', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'test@finhub.com',
        password: 'password123'
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      token = res.body.token; // Save token for next tests
    });
  });

  describe('2. Account Routes', () => {
    it('should block unauthenticated access', async () => {
      const res = await request(app).get('/api/accounts');
      expect(res.status).toBe(401);
    });

    it('should create an account via JWT', async () => {
      const res = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nubank', type: 'CREDIT_CARD', dueDate: 10 });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Nubank');
    });
  });

  describe('3. Transaction & Loan Routes', () => {
    it('should simulate a SAC loan properly', async () => {
      const res = await request(app)
        .post('/api/transactions/simulate-loan')
        .set('Authorization', `Bearer ${token}`)
        .send({ principal: 1000, annualRate: 0.12, months: 3, type: 'SAC' });
      expect(res.status).toBe(200);
      expect(res.body.schedule).toHaveLength(3);
    });

    it('should allow fetching transactions', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('4. Social Routes (Debt Simplification)', () => {
    it('should accept debt simplification algorithms', async () => {
      const res = await request(app)
        .post('/api/social/simplify')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transactions: [
            { from: 'A', to: 'B', amount: 100 },
            { from: 'B', to: 'C', amount: 100 }
          ]
        });
      expect(res.status).toBe(200);
      expect(res.body.optimizedCount).toBe(1); // Merged into A -> C
    });
  });
});
