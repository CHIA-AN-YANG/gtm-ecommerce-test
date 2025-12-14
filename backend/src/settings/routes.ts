import { FastifyPluginAsync } from 'fastify';

interface SettingsBody {
  gtm_container_id: string;
  ga_measurement_id: string;
}

interface SettingsParams {
  id: string;
}

const settingsRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/settings - Retrieve all settings for the authenticated user
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
      SELECT id, gtm_container_id, ga_measurement_id, updated_at
      FROM user_settings
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `
        )
        .all(userId);

      return reply.send(settings);
    }
  );

  // POST /api/settings - Create a new user settings record
  fastify.post<{ Body: SettingsBody }>(
    '/api/settings',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['gtm_container_id', 'ga_measurement_id'],
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
      if (!gtm_container_id.startsWith('GTM-')) {
        return reply.code(400).send({
          error: 'Invalid GTM Container ID',
          message: 'GTM Container ID must start with "GTM-"',
        });
      }

      // Validate GA4 Measurement ID
      if (!ga_measurement_id.startsWith('G-')) {
        return reply.code(400).send({
          error: 'Invalid GA4 Measurement ID',
          message: 'GA4 Measurement ID must start with "G-"',
        });
      }

      // Insert new settings
      const result = fastify.db
        .prepare(
          `
        INSERT INTO user_settings (user_id, gtm_container_id, ga_measurement_id)
        VALUES (?, ?, ?)
      `
        )
        .run(userId, gtm_container_id, ga_measurement_id);

      // Fetch and return the created settings
      const newSettings = fastify.db
        .prepare(
          `
      SELECT id, gtm_container_id, ga_measurement_id, updated_at
      FROM user_settings
      WHERE id = ?
    `
        )
        .get(result.lastInsertRowid);

      return reply.code(201).send(newSettings);
    }
  );

  // PUT /api/settings/:id - Update an existing setting
  fastify.put<{ Body: SettingsBody; Params: SettingsParams }>(
    '/api/settings/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['gtm_container_id', 'ga_measurement_id'],
          properties: {
            gtm_container_id: { type: 'string' },
            ga_measurement_id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.user_id;
      const settingId = parseInt(request.params.id, 10);
      const { gtm_container_id, ga_measurement_id } = request.body;

      // Validate GTM Container ID
      if (!gtm_container_id.startsWith('GTM-')) {
        return reply.code(400).send({
          error: 'Invalid GTM Container ID',
          message: 'GTM Container ID must start with "GTM-"',
        });
      }

      // Validate GA4 Measurement ID
      if (!ga_measurement_id.startsWith('G-')) {
        return reply.code(400).send({
          error: 'Invalid GA4 Measurement ID',
          message: 'GA4 Measurement ID must start with "G-"',
        });
      }

      // Check if the setting exists and belongs to the user
      const existingSetting = fastify.db
        .prepare(
          `
      SELECT id FROM user_settings WHERE id = ? AND user_id = ?
    `
        )
        .get(settingId, userId);

      if (!existingSetting) {
        return reply.code(404).send({
          error: 'Setting not found',
          message: 'Setting does not exist or does not belong to you',
        });
      }

      // Update the setting
      fastify.db
        .prepare(
          `
        UPDATE user_settings
        SET gtm_container_id = ?, ga_measurement_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `
        )
        .run(gtm_container_id, ga_measurement_id, settingId, userId);

      // Fetch and return updated settings
      const updatedSettings = fastify.db
        .prepare(
          `
      SELECT id, gtm_container_id, ga_measurement_id, updated_at
      FROM user_settings
      WHERE id = ?
    `
        )
        .get(settingId);

      return reply.send(updatedSettings);
    }
  );

  // DELETE /api/settings/:id - Delete a specific setting
  fastify.delete<{ Params: SettingsParams }>(
    '/api/settings/:id',
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.user_id;
      const settingId = parseInt(request.params.id, 10);

      // Check if the setting exists and belongs to the user
      const existingSetting = fastify.db
        .prepare(
          `
      SELECT id FROM user_settings WHERE id = ? AND user_id = ?
    `
        )
        .get(settingId, userId);

      if (!existingSetting) {
        return reply.code(404).send({
          error: 'Setting not found',
          message: 'Setting does not exist or does not belong to you',
        });
      }

      // Delete the setting
      fastify.db
        .prepare(
          `
        DELETE FROM user_settings WHERE id = ? AND user_id = ?
      `
        )
        .run(settingId, userId);

      return reply.code(204).send();
    }
  );
};

export default settingsRoutes;
