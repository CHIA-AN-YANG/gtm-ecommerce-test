import { describe, it, expect, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import fastifyJWT from '@fastify/jwt';
import Database from 'better-sqlite3';
import authRoutes from './routes.js';
import authPlugin from './plugin.js';
import { config } from '../config.js';

describe('Auth Routes', () => {
  let app: FastifyInstance;
  let db: Database.Database;

  beforeEach(async () => {
    // Create a new Fastify instance for each test
    app = Fastify({
      logger: false,
    });

    // Create an in-memory SQLite database
    db = new Database(':memory:');

    // Create the users table
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Decorate Fastify with the database instance
    app.decorate('db', db);

    // Register JWT plugin
    await app.register(fastifyJWT, {
      secret: config.jwt.secret,
      sign: {
        expiresIn: config.jwt.expiresIn,
      },
    });

    // Register auth plugin
    await app.register(authPlugin);

    // Register auth routes
    await app.register(authRoutes, { prefix: '/auth' });

    await app.ready();
  });

  describe('POST /auth/register', () => {
    it('should successfully register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(201);

      const body = response.json();
      expect(body).toHaveProperty('user_id');
      expect(body).toHaveProperty('email', 'test@example.com');
      expect(body).toHaveProperty('token');
      expect(typeof body.token).toBe('string');
      expect(body.token.length).toBeGreaterThan(0);

      // Verify JWT token is valid
      const decoded = app.jwt.verify(body.token);
      expect(decoded).toHaveProperty('user_id', body.user_id);
      expect(decoded).toHaveProperty('email', 'test@example.com');
    });

    it('should return 400 when email is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 when password is shorter than 6 characters', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: '12345',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty(
        'error',
        'Password must be at least 6 characters'
      );
    });

    it('should return 409 when email is already registered', async () => {
      // First registration
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      // Second registration with same email
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'differentpassword',
        },
      });

      expect(response.statusCode).toBe(409);

      const body = response.json();
      expect(body).toHaveProperty('error', 'Email already registered');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
    });

    it('should successfully login with correct credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('user_id');
      expect(body).toHaveProperty('email', 'test@example.com');
      expect(body).toHaveProperty('token');
      expect(typeof body.token).toBe('string');
      expect(body.token.length).toBeGreaterThan(0);

      // Verify JWT token is valid
      const decoded = app.jwt.verify(body.token);
      expect(decoded).toHaveProperty('user_id', body.user_id);
      expect(decoded).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(401);

      const body = response.json();
      expect(body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should return 401 with invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });

      expect(response.statusCode).toBe(401);

      const body = response.json();
      expect(body).toHaveProperty('error', 'Invalid email or password');
    });

    it('should return 400 when email is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          password: 'password123',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = response.json();
      expect(body).toHaveProperty('error', 'Email and password are required');
    });
  });
});
