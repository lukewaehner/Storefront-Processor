FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies
COPY backend/package*.json ./
RUN npm ci

# Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .

RUN npm run build

# Production image, copy only the required files
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy node modules and build artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Copy prisma schema and migrations for potential runtime use
COPY --from=builder /app/prisma ./prisma

# Use non-root user for security
USER nestjs

EXPOSE 4000

ENV PORT 4000

# Run database migrations and start the app
CMD ["sh", "-c", "npm run prisma:migrate:deploy && node dist/main"] 