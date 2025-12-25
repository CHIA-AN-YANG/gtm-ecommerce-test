# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Build Angular SSR
RUN yarn build

# ---------- Runtime stage ----------
FROM node:20-alpine

WORKDIR /app

# Copy built output
COPY --from=builder /app/dist/gtm-test-app ./dist/gtm-test-app

# Copy node_modules (SSR needs them)
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json for metadata
COPY package.json ./

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Start Angular SSR server
CMD ["node", "dist/gtm-test-app/server/server.mjs"]
