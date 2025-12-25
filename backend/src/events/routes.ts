import { FastifyPluginAsync } from 'fastify';

interface EventBody {
  event_name: string;
  payload: Record<string, any>;
}

const MAX_EVENTS_PER_USER = 20;

const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/api/events',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user.user_id;

      const events = fastify.db
        .prepare(
          `
      SELECT id, event_name, payload, created_at
      FROM events
      WHERE user_id = ?
      ORDER BY created_at DESC
    `
        )
        .all(userId);

      return reply.send(events);
    }
  );
  // POST /api/events - Store GA4 ecommerce event with per-user limit
  fastify.post<{ Body: EventBody }>(
    '/api/events',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['event_name', 'payload'],
          properties: {
            event_name: { type: 'string' },
            payload: { type: 'object' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.user_id;
      const { event_name, payload } = request.body;

      // Use a transaction to ensure atomicity
      const transaction = fastify.db.transaction(() => {
        // Count current events for this user
        const countResult = fastify.db
          .prepare(
            `
        SELECT COUNT(*) as count
        FROM events
        WHERE user_id = ?
      `
          )
          .get(userId) as { count: number };

        const currentCount = countResult.count;

        // If at limit, delete the oldest event for this user
        if (currentCount >= MAX_EVENTS_PER_USER) {
          fastify.db
            .prepare(
              `
          DELETE FROM events
          WHERE id = (
            SELECT id
            FROM events
            WHERE user_id = ?
            ORDER BY created_at ASC
            LIMIT 1
          )
        `
            )
            .run(userId);
        }

        // Insert the new event
        const result = fastify.db
          .prepare(
            `
        INSERT INTO events (user_id, event_name, payload)
        VALUES (?, ?, ?)
      `
          )
          .run(userId, event_name, JSON.stringify(payload));

        return result;
      });

      // Execute the transaction
      const result = transaction();

      return reply.code(201).send({
        success: true,
        event_id: result.lastInsertRowid,
      });
    }
  );
};

export default eventsRoutes;
