import Database from 'better-sqlite3';
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database;
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }

  interface FastifyRequest {
    user: {
      user_id?: string;
      email?: string;
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      user_id: number;
      email: string;
    };
  }
}
