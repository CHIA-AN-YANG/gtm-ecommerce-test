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

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register endpoint
  fastify.post<{ Body: RegisterBody }>('/register', async (request, reply) => {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return reply.code(400).send({ error: 'Password must be at least 6 characters' });
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

      return reply.code(201).send({
        user_id: result.lastInsertRowid,
        email,
        token,
      });
    } catch (error: any) {
      // Handle duplicate email
      if (error.code === 'SQLITE_CONSTRAINT' || error.message.includes('UNIQUE')) {
        return reply.code(409).send({ error: 'Email already registered' });
      }

      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to register user' });
    }
  });

  // Login endpoint
  fastify.post<{ Body: LoginBody }>('/login', async (request, reply) => {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
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
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash);

      if (!isValidPassword) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = fastify.jwt.sign({
        user_id: user.id,
        email: user.email,
      });

      return reply.send({
        user_id: user.id,
        email: user.email,
        token,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to login' });
    }
  });
};

export default authRoutes;
