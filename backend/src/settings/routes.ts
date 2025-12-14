import { FastifyPluginAsync } from 'fastify';

interface SettingsBody {
  gtm_container_id?: string;
  ga_measurement_id?: string;
}

const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/settings - Retrieve user's GTM and GA4 settings
  fastify.get(
    '/api/settings',
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user.user_id;

      const settings = fastify.db
        .prepare(
          `
      SELECT gtm_container_id, ga_measurement_id, updated_at
      FROM user_settings
      WHERE user_id = ?
    `
        )
        .get(userId);

      if (!settings) {
        return reply.send({
          gtm_container_id: null,
          ga_measurement_id: null,
        });
      }

      return reply.send(settings);
    }
  );

  // PUT /api/settings - Create or update user's GTM and GA4 settings
  fastify.put<{ Body: SettingsBody }>(
    '/api/settings',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          properties: {
            gtm_container_id: { type: 'string' },
            ga_measurement_id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.user_id;
      const { gtm_container_id, ga_measurement_id } = request.body;

      // Validate GTM Container ID
      if (gtm_container_id !== undefined && gtm_container_id !== null) {
        if (!gtm_container_id.startsWith('GTM-')) {
          return reply.code(400).send({
            error: 'Invalid GTM Container ID',
            message: 'GTM Container ID must start with "GTM-"',
          });
        }
      }

      // Validate GA4 Measurement ID
      if (ga_measurement_id !== undefined && ga_measurement_id !== null) {
        if (!ga_measurement_id.startsWith('G-')) {
          return reply.code(400).send({
            error: 'Invalid GA4 Measurement ID',
            message: 'GA4 Measurement ID must start with "G-"',
          });
        }
      }

      // Check if settings exist for this user
      const existingSettings = fastify.db
        .prepare(
          `
      SELECT id FROM user_settings WHERE user_id = ?
    `
        )
        .get(userId);

      if (existingSettings) {
        // Update existing settings
        const updates: string[] = [];
        const params: any[] = [];

        if (gtm_container_id !== undefined) {
          updates.push('gtm_container_id = ?');
          params.push(gtm_container_id);
        }

        if (ga_measurement_id !== undefined) {
          updates.push('ga_measurement_id = ?');
          params.push(ga_measurement_id);
        }

        if (updates.length > 0) {
          updates.push('updated_at = CURRENT_TIMESTAMP');
          params.push(userId);

          fastify.db
            .prepare(
              `
          UPDATE user_settings
          SET ${updates.join(', ')}
          WHERE user_id = ?
        `
            )
            .run(...params);
        }
      } else {
        // Insert new settings
        fastify.db
          .prepare(
            `
        INSERT INTO user_settings (user_id, gtm_container_id, ga_measurement_id)
        VALUES (?, ?, ?)
      `
          )
          .run(userId, gtm_container_id || null, ga_measurement_id || null);
      }

      // Fetch and return updated settings
      const updatedSettings = fastify.db
        .prepare(
          `
      SELECT gtm_container_id, ga_measurement_id, updated_at
      FROM user_settings
      WHERE user_id = ?
    `
        )
        .get(userId);

      return reply.send(updatedSettings);
    }
  );
};

export default settingsRoutes;
