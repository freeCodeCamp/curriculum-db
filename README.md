# freeCodeCamp Curriculum GraphQL API

A TypeScript GraphQL API server for freeCodeCamp curriculum metadata, built as a pnpm monorepo with Turbo. Provides structured access to curriculum data including superblocks, blocks, challenges, and certifications.

> [!WARNING]
> This project is in early alpha. The API is under active development and may undergo breaking changes without notice.

## Quick Start

```bash
# Install dependencies
pnpm install

# Fetch curriculum data
pnpm fetch-data

# Start development server (hot reload)
pnpm develop
```

## Build

Build and push locally:

```bash
# 1. Install dependencies
pnpm install

# 2. Fetch curriculum data
pnpm fetch-data

# 3. Build TypeScript
pnpm build

# 4. Build Docker image (fetches data again inside container)
docker build -t curriculum-db .

# 5. Tag for DOCR
docker tag curriculum-db registry.digitalocean.com/{DOCR_NAME}/dev/curriculum-db:latest

# 6. Push to DOCR
docker push registry.digitalocean.com/{DOCR_NAME}/dev/curriculum-db:latest

```

OR with CI:

```bash
gh workflow run docker-docr.yml -f site_tld={SITE_TLD}
```
