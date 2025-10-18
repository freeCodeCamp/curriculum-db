# freeCodeCamp Curriculum GraphQL API

A TypeScript GraphQL API server for freeCodeCamp curriculum metadata, built as a pnpm monorepo with Turbo. Provides structured access to curriculum data including superblocks, blocks, challenges, and certifications.

## Features

- **GraphQL API**: Modern, type-safe GraphQL schema for curriculum data
- **Metadata-Only**: Efficient in-memory storage of curriculum structure (<50MB)
- **Monorepo Architecture**: pnpm workspaces with Turbo orchestration
- **Type Safety**: Strict TypeScript with zero `any` types
- **Future-Ready**: Designed for seamless database integration
- **Health Monitoring**: Built-in health checks and metrics

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (hot reload)
pnpm develop
```

## Development

### Prerequisites

- Node.js 18+ (uses ESM)
- pnpm 8+

### Available Commands

#### Root Commands (Monorepo)
```bash
# Install dependencies
pnpm install

# Development server (hot reload)
pnpm develop

# Build all packages
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Code formatting
pnpm format

# Check formatting
pnpm format:check

# Generate GraphQL types
pnpm codegen

# Watch mode for GraphQL codegen
pnpm codegen:watch

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Performance testing
pnpm test:perf

# Run tests with coverage
pnpm test:coverage
```

### Project Structure

```
curriculum-db/
├── data/                    # Curriculum data (copied from main repo)
│   └── structure/
│       ├── curriculum.json
│       ├── superblocks/     # 37 superblock JSON files
│       └── blocks/          # 737 block JSON files
├── packages/
│   └── server/              # GraphQL API server
│       ├── src/
│       │   ├── data/        # Data loading and types
│       │   ├── schema/      # GraphQL schema and resolvers
│       │   └── utils/       # Utilities and helpers
│       └── package.json
├── docs/                    # Documentation
├── CLAUDE.md               # AI development guide
└── tsconfig.base.json      # Shared TypeScript config
```

### GraphQL Playground

Once running, visit the GraphQL playground at:
- **Local**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

### Data Scale

- **37 superblocks** across learning paths
- **737 blocks** containing modules
- **32+ certifications** for completion
- **~36,000 challenges** total (metadata only in MVP)

## Architecture

### Design Principles

- **Metadata vs Content**: Separates curriculum structure (always in-memory) from challenge content (future database)
- **Data Provider Abstraction**: Clean interface allowing different storage backends
- **Type Safety**: Three-layer type system (Raw JSON → Normalized Internal → Generated GraphQL)
- **Memory Efficient**: <50MB memory usage for full curriculum metadata

### Tech Stack

- **GraphQL Yoga**: Modern GraphQL server
- **TypeScript**: Strict type safety with all flags enabled
- **Turbo**: Monorepo task orchestration
- **pnpm**: Efficient package management
- **ESLint + Prettier**: Code quality and formatting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Check types: `pnpm type-check`
6. Format code: `pnpm format`
7. Submit a pull request

## License

BSD-3-Clause
