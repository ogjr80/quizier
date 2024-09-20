##### DEPENDENCIES
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
ARG AUTH_SECRET
ARG NEXT_PUBLIC_URL
ARG AUTH_URL
ARG AUTH_GITHUB_ID
ARG AUTH_GITHUB_SECRET
ARG AUTH_GOOGLE_ID
ARG AUTH_GOOGLE_SECRET
ARG PLATFORM=linux/amd64
FROM --platform=linux/amd64 node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl git curl 
WORKDIR /app

# Install Prisma Client - remove if not using Prisma
ENV NEXT_TELEMETRY_DISABLED=true
COPY prisma ./

# Install dependencies based on the preferred package manager

COPY package.json pnpm-lock.yaml\* ./
RUN corepack enable
RUN corepack prepare yarn@stable --activate
RUN corepack prepare pnpm@9.1.4 --activate

# Install dependencies and generate Prisma client
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --no-frozen-lockfile && npx prisma generate

##### BUILDER

FROM --platform=${PLATFORM} node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ENV NEXT_TELEMETRY_DISABLED 1
COPY package.json pnpm-lock.yaml\* ./
RUN corepack enable
RUN corepack prepare yarn@stable --activate
RUN corepack prepare pnpm@9.1.4 --activate
RUN SKIP_ENV_VALIDATION=1 pnpm run build

##### RUNNER

FROM --platform=linux/amd64 gcr.io/distroless/nodejs20-debian12 AS runner
WORKDIR /app

ENV NODE_ENV=production

# ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000
ENV AUTH_TRUST_HOST=1

EXPOSE 3000
CMD ["server.js"]