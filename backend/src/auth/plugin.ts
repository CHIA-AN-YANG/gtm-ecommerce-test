import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const authPluginImpl: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async function (request: any, reply: any) {
    const token = request.cookies.auth_token;
    if (!token) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }

    try {
      request.user = fastify.jwt.verify(token);
    } catch {
      return reply.code(401).send({ message: 'Invalid token' });
    }
  });
};

export default fp(authPluginImpl);
