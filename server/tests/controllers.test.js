import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';

describe('Auth Controller Tests', () => {
    it('Should return 400 if registering with invalid data', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'bademail', password: '123' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.errors).toBeDefined();
    });

    // Real implementation requires mocked MongoDB and JWTs
});
