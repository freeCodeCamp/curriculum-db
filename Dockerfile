# Multi-stage Docker build for freeCodeCamp Curriculum GraphQL API
# Follows freeCodeCamp's main repository build patterns

# Stage 1: Builder - Build TypeScript and fetch curriculum data
FROM node:22-bookworm AS builder

# Install dependencies needed for build
RUN apt-get update && apt-get install -y git

# Install pnpm globally before switching to node user
RUN npm i -g pnpm@10

# Use the existing node user from the base image
USER node
WORKDIR /home/node/build

# Copy package files with correct ownership
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY --chown=node:node tsconfig*.json ./
COPY --chown=node:node packages/server/ packages/server/
COPY --chown=node:node scripts/ scripts/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Fetch curriculum data using git sparse-checkout
RUN node scripts/fetch-curriculum-data.mjs

# Build the TypeScript project
RUN pnpm build

# Stage 2: Production Dependencies
FROM node:22-bookworm AS deps

WORKDIR /home/node/build

# Copy package files
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=node:node packages/server/package.json packages/server/

# Install pnpm globally
RUN npm i -g pnpm@10

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Stage 3: Production Runtime
FROM node:22-bookworm

# Use the node user for production
USER node
WORKDIR /home/node/fcc

# Set production environment
ENV NODE_ENV=production

# Copy built application from builder
COPY --from=builder --chown=node:node /home/node/build/packages/server/dist/ packages/server/dist/
COPY --from=builder --chown=node:node /home/node/build/data/ data/

# Copy production dependencies from deps stage
COPY --from=deps --chown=node:node /home/node/build/node_modules/ node_modules/
COPY --from=deps --chown=node:node /home/node/build/packages/server/node_modules/ packages/server/node_modules/

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/graphql?query={__typename}', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start server
CMD ["node", "packages/server/dist/index.js"]
