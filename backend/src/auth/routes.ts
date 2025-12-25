import { FastifyPluginAsync } from 'fastify';
import { hashPassword, verifyPassword } from './utils.js';

interface RegisterBody {
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

const TOKEN_COOKIE_NAME = 'auth_token';

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register endpoint
  fastify.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      return reply
        .code(400)
        .send({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return reply
        .code(400)
        .send({ message: 'Password must be at least 6 characters' });
    }

    try {
      // Hash password
      const passwordHash = await hashPassword(password);

      // Insert user into database
      const stmt = fastify.db.prepare(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)'
      );

      const result = stmt.run(email, passwordHash);

      // Generate JWT token
      const token = fastify.jwt.sign({
        user_id: result.lastInsertRowid,
        email,
      });

      // Set token in HttpOnly, Secure cookie
      reply.setCookie(TOKEN_COOKIE_NAME, token, COOKIE_CONFIG);

      return reply.code(201).send({
        user_id: result.lastInsertRowid,
        email,
      });
    } catch (error: any) {
      // Handle duplicate email
      if (
        error.code === 'SQLITE_CONSTRAINT' ||
        error.message.includes('UNIQUE')
      ) {
        return reply.code(409).send({ message: 'Email already registered' });
      }

      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to register user' });
    }
  });

  // Login endpoint
  fastify.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      return reply.code(400).send('Email and password are required');
    }

    try {
      // Find user by email
      const stmt = fastify.db.prepare(
        'SELECT id, email, password_hash FROM users WHERE email = ?'
      );

      const user = stmt.get(email) as
        | { id: number; email: string; password_hash: string }
        | undefined;

      if (!user) {
        return reply.code(401).send({ message: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(
        password,
        user.password_hash
      );

      if (!isValidPassword) {
        return reply.code(401).send({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = fastify.jwt.sign({
        user_id: user.id,
        email: user.email,
      });

      // Set token in HttpOnly, Secure cookie
      reply.setCookie(TOKEN_COOKIE_NAME, token, COOKIE_CONFIG);

      return reply.send({
        user_id: user.id,
        email: user.email,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ message: 'Failed to login' });
    }
  });

  // Logout endpoint
  fastify.post(
    '/logout',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      // Clear the token cookie
      reply.clearCookie(TOKEN_COOKIE_NAME);

      return reply.send({ message: 'Logged out successfully' });
    }
  );

  // Auth status endpoint
  fastify.get('/status', async (request, reply) => {
    try {
      await request.jwtVerify();
      return reply.send({ authenticated: true });
    } catch (error) {
      return reply.send({ authenticated: false });
    }
  });
};

export default authRoutes;
