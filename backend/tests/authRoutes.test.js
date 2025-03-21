const request = require('supertest');
const app = require('../server'); // Import server instance

describe('Auth Routes', () => {
    it('should register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: `test${Date.now()}@example.com`, // Unique email
            password: 'TestPassword123'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should not allow duplicate user registration', async () => {
        await request(app).post('/api/auth/register').send({
            email: 'duplicate@example.com',
            password: 'password'
        });

        const res = await request(app).post('/api/auth/register').send({
            email: 'duplicate@example.com',
            password: 'password'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
    });

    it('should not log in with wrong password', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'testuser@example.com',
            password: 'wrongpassword'
        });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
});
