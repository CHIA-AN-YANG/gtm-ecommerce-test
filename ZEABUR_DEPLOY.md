# Zeabur Deployment Guide

This monorepo contains two services configured for Zeabur deployment:

## Services

### Backend (Fastify)
- **Location**: `backend/`
- **Port**: 8080 (configurable via `PORT` env variable)
- **Build**: Multi-stage Docker build with TypeScript compilation
- **Database**: SQLite stored in `/app/data` volume

### Frontend (Angular)
- **Location**: `gtm-test-app/`
- **Port**: 8080 (configurable via `PORT` env variable)
- **Server**: Caddy (static file server with SPA routing)
- **Build**: Static files served from `/srv`

## Environment Variables

### Backend
Create these in Zeabur dashboard:

```env
PORT=8080                           # Zeabur will set this automatically
JWT_SECRET=your_jwt_secret_key      # Set a strong secret
DEFAULT_USER_EMAIL=admin@example.com
DEFAULT_USER_PASSWORD=changeme
DEFAULT_GTM_CONTAINER_ID=GTM-XXXXXXXX
```

### Frontend
No environment variables required - API calls use relative path `/api` in production.

## Zeabur Configuration

### Deploy Backend
1. Create new service in Zeabur
2. Select "Backend" service
3. Set **Root Directory**: `backend`
4. Zeabur will auto-detect the Dockerfile
5. Add environment variables
6. Deploy

### Deploy Frontend
1. Create new service in Zeabur
2. Select "Frontend" service
3. Set **Root Directory**: `gtm-test-app`
4. Zeabur will auto-detect the Dockerfile
5. Deploy

### Routing Setup
Configure Zeabur to route:
- `/api/*` → Backend service
- `/*` → Frontend service

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev  # Runs on port 8080
```

### Frontend
```bash
cd gtm-test-app
npm install
npm start    # Runs on port 4200, proxies API to localhost:8080
```

## Docker Build & Test Locally

### Backend
```bash
cd backend
docker build -t backend .
docker run -p 8080:8080 \
  -e JWT_SECRET=test-secret \
  -v $(pwd)/data:/app/data \
  backend
```

### Frontend
```bash
cd gtm-test-app
docker build -t frontend .
docker run -p 8080:8080 frontend
```

## Production Checklist

- [ ] Set strong `JWT_SECRET` in backend environment
- [ ] Configure CORS in backend for frontend domain
- [ ] Set up persistent volume for SQLite database in backend
- [ ] Verify SPA routing works (refresh on any route)
- [ ] Test API proxy routing (`/api` → backend)
- [ ] Monitor logs for both services

## Architecture

```
┌─────────────────┐
│   Zeabur Load   │
│    Balancer     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ /*   │  │ /api │
│Frontend Backend│
│(Caddy)│  │(Node)│
│:8080 │  │:8080 │
└──────┘  └──┬───┘
             │
          ┌──▼──┐
          │SQLite│
          └─────┘
```
