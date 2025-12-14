# GTM E-commerce Backend

Node.js + Fastify backend with SQLite database.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## Build

```bash
npm run build
npm start
```

## Database

SQLite database is stored in `data/app.db` (persistent volume).

### Tables

- **users**: `id`, `email`, `password_hash`, `created_at`
- **user_settings**: `id`, `user_id`, `gtm_container_id`, `ga_measurement_id`, `updated_at`
- **events**: `id`, `user_id`, `event_name`, `payload`, `created_at`

## API Endpoints

- `GET /health` - Health check endpoint
