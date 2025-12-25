# Zeabur Deployment Guide

This monorepo contains two services configured for Zeabur deployment:

## Services

### Backend (Fastify + Node.js)
- **Location**: `backend/`
- **Port**: 8080 (configurable via `PORT` env variable)
- **Build**: Multi-stage Docker build with TypeScript compilation
- **Runtime**: Node.js 20 Alpine
- **Database**: SQLite stored in `/app/data` volume (requires persistent volume)
- **Entry Point**: `node dist/server.js`

### Frontend (Angular SSR)
- **Location**: `gtm-test-app/`
- **Port**: 4000 (configurable via `PORT` env variable)
- **Runtime**: Node.js 20 Alpine with Angular Universal SSR
- **Build**: Angular SSR build (not static files)
- **Entry Point**: `node dist/gtm-test-app/server/server.mjs`

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
```env
PORT=4000                           # Zeabur will set this automatically
```

**Note**: Frontend uses `http://localhost:8080/api` for API calls. In production, configure reverse proxy or update `environment.ts` to use your backend URL.

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

**Option 1: Separate Domains (Recommended)**
- Backend: `api.yourdomain.com` (port 8080)
- Frontend: `yourdomain.com` (port 4000)
- Update `environment.ts` with backend URL: `https://api.yourdomain.com`

**Option 2: Single Domain with Path-Based Routing**
- Configure Zeabur gateway/nginx:
  - `/api/*` → Backend service (port 8080)
  - `/*` → Frontend service (port 4000)

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
yarn install
yarn dev     # Runs on port 4200 with SSR
```

## Docker Build & Test Locally

### Backend
```bash
cd backend
docker build -t gtm-backend:test .
docker run -d --name gtm-backend \
  -p 8080:8080 \
  -e JWT_SECRET=test-secret-key \
  -v $(pwd)/data:/app/data \
  gtm-backend:test

# Check logs
docker logs gtm-backend

# Test health endpoint
curl http://localhost:8080/health
```

### Frontend
```bash
cd gtm-test-app
docker build -t gtm-frontend:test .
docker run -d --name gtm-frontend \
  -p 4000:4000 \
  gtm-frontend:test

# Check logs
docker logs gtm-frontend

# Test frontend
open http://localhost:4000
```

### Stop & Clean Up
```bash
docker stop gtm-backend gtm-frontend
docker rm gtm-backend gtm-frontend
```

## Production Checklist

### Backend
- [ ] Set strong `JWT_SECRET` in backend environment variables
- [ ] Configure `DEFAULT_USER_EMAIL` and `DEFAULT_USER_PASSWORD` for initial user
- [ ] Set up **persistent volume** for `/app/data` (SQLite database)
- [ ] Configure CORS for your frontend domain
- [ ] Verify health endpoint: `https://api.yourdomain.com/health`
- [ ] Test authentication endpoints (register/login)

### Frontend
- [ ] Update `environment.ts` with production backend URL
- [ ] Verify SSR is working (view source should show rendered HTML)
- [ ] Test all routes work on refresh (SSR handles routing)
- [ ] Check API calls reach backend correctly
- [ ] Monitor SSR server logs for errors

### Infrastructure
- [ ] Set up monitoring/alerts for both services
- [ ] Configure backup strategy for SQLite database
- [ ] Test failover and restart scenarios

## Architecture

```
┌─────────────────────────┐
│    Zeabur Platform      │
└────────┬────────────────┘
         │
    ┌────┴────────┐
    │             │
┌───▼────┐    ┌───▼────┐
│Frontend│    │Backend │
│ (SSR)  │    │(Fastify)│
│ Node.js│───▶│ Node.js│
│  :4000 │    │  :8080 │
└────────┘    └────┬───┘
                   │
              ┌────▼────┐
              │ SQLite  │
              │Database │
              │ Volume  │
              └─────────┘
```

### Request Flow
1. User requests → `yourdomain.com` → Frontend SSR (port 4000)
2. Frontend makes API calls → `api.yourdomain.com` or `/api` → Backend (port 8080)
3. Backend processes request, queries SQLite, returns JSON
4. Frontend SSR renders page with data, serves to client

### Technology Stack
- **Frontend**: Angular 19 with SSR (Universal), TypeScript
- **Backend**: Fastify 4, TypeScript, bcrypt, JWT
- **Database**: SQLite 3 with better-sqlite3
- **Runtime**: Node.js 20 Alpine (both services)
- **Deployment**: Docker multi-stage builds on Zeabur
