import Fastify from 'fastify';
import fastifyJWT from '@fastify/jwt';
import { initDatabase } from './database.js';
import { config } from './config.js';
import authPlugin from './auth/plugin.js';
import authRoutes from './auth/routes.js';
import settingsRoutes from './settings/routes.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Initialize database
  const db = initDatabase();

  // Make database available throughout the app
  fastify.decorate('db', db);

  // Register JWT plugin
  await fastify.register(fastifyJWT, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
    },
  });

  // Register auth plugin (provides authenticate decorator)
  await fastify.register(authPlugin);

  // Register auth routes
  await fastify.register(authRoutes, { prefix: '/auth' });

  // Register settings routes
  await fastify.register(settingsRoutes);

  // Health check endpoint
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok' };
  });

  return fastify;
}

async function start() {
  try {
    const server = await buildServer();

    await server.listen({ port: PORT, host: HOST });

    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    console.log(`📍 Health check: http://${HOST}:${PORT}/health`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
