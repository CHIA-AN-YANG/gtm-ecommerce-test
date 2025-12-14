import Database from 'better-sqlite3';
import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database;
    authenticate: (request: any, reply: any) => Promise<void>;
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
