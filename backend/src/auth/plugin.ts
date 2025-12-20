import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const authPluginImpl: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
      request.user = {
        user_id: request.user.user_id,
        email: request.user.email,
      };
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
};

export default fp(authPluginImpl);
