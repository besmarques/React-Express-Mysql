process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const autoRenewToken = require('./autoRenewToken');

const publicApiPaths = [
    '/api/auth-status',
    '/api/forgot-password',
    '/api/login',
    '/api/reset-password',
    '/api/settings',
    '/api/signup',
    '/api/cms/public/pages/home',
    '/api/cms/public/posts/hello-world',
];

const createApp = () => {
    const app = express();

    app.use(cookieParser());
    app.use(autoRenewToken);

    publicApiPaths.forEach((path) => {
        app.use(path, (req, res) => {
            res.status(200).json({ reached: true });
        });
    });

    app.use('/api/protected', (req, res) => {
        res.status(200).json({ reached: true });
    });

    return app;
};

describe('autoRenewToken', () => {
    it.each(publicApiPaths)('allows %s through with an invalid token cookie', async (path) => {
        const res = await request(createApp())
            .get(path)
            .set('Cookie', 'token=invalid-token');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ reached: true });
        expect(res.headers['set-cookie'][0]).toContain('token=');
    });

    it('rejects protected API routes with an invalid token cookie', async () => {
        const res = await request(createApp())
            .get('/api/protected')
            .set('Cookie', 'token=invalid-token');

        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ message: 'Unauthorized: Invalid token' });
    });

    it('renews an expiring valid token cookie on protected API routes', async () => {
        const token = jwt.sign({ id: 1, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '10m' });

        const res = await request(createApp())
            .get('/api/protected')
            .set('Cookie', `token=${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.headers['set-cookie'][0]).toContain('token=');
    });
});
