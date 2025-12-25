# GTM E-commerce Backend

Node.js + Fastify backend with SQLite database.

## Setup
1. Install dependancies
2. Set up `.env` file based on `.env.example`

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

## Run Docker

```bash
# docker build
cd /backend && docker build -t gtm-backend:test .

# run, add environment variables if .env is not set
docker run -d --name gtm-backend -p 8080:8080 -e JWT_SECRET=test-secret-key-for-development -v /Users/annayang/o/vibe-code/gtm-ecommerce-test/backend/data:/app/data gtm-backend:test

# check status
docker logs gtm-backend
```