# Curriculum Studio

Visual editor for freeCodeCamp curriculum metadata. Connects to the curriculum GraphQL API to browse and edit superblocks, blocks, and challenges.

**MVP1** -- read-only GraphQL queries with local-only draft editing. No authentication, no mutations.

## Setup

### Prerequisites

- Node.js 20+
- pnpm 10+
- The GraphQL API server running (see root project README)

### Environment

Copy the example env file and adjust if needed:

```bash
cp .env.local.example .env.local
```

| Variable                  | Default                         | Description          |
| ------------------------- | ------------------------------- | -------------------- |
| `NEXT_PUBLIC_GRAPHQL_URL` | `http://localhost:4000/graphql` | GraphQL API endpoint |

### Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm type-check   # TypeScript strict check
pnpm lint         # Lint with oxlint
pnpm test         # Run tests with vitest
pnpm codegen      # Regenerate GraphQL types from schema
```

To run the full stack from the monorepo root:

```bash
pnpm develop      # Starts both the GraphQL server and Studio
```

## Architecture

### Tech stack

- **Framework**: Next.js 15 (App Router) with TypeScript strict mode
- **GraphQL client**: urql v5 with document cache
- **UI**: Tailwind CSS v4, shadcn-style components (CVA + clsx)
- **Draft system**: localStorage + fast-json-patch (RFC 6902)
- **Testing**: vitest

### Project structure

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Curriculum overview (/)
    layout.tsx            # Root layout with sidebar
    superblocks/
      [dashedName]/page.tsx   # Superblock detail
    blocks/
      [dashedName]/page.tsx   # Block detail (main editing page)
    challenges/
      [id]/page.tsx       # Challenge detail
    drafts/
      page.tsx            # Drafts listing
  components/             # React components
    providers.tsx         # urql Provider
    sidebar.tsx           # Searchable superblock sidebar
    breadcrumbs.tsx       # Breadcrumb navigation
    challenge-table.tsx   # Challenge order table with reorder
    diff-viewer.tsx       # JSON Patch diff viewer
    draft-indicator.tsx   # Draft status badges
    ui/                   # Reusable UI primitives
  graphql/
    types.ts              # TypeScript types matching GraphQL schema
    queries.ts            # GraphQL query definitions
  lib/
    drafts.ts             # Draft store (localStorage + JSON Patch)
    use-draft.ts          # React hook for draft management
    validation.ts         # Validation rules
    urql.ts               # urql client configuration
    utils.ts              # Shared utilities
```

## How drafts work

Drafts are stored in `localStorage` using keys like `draft:block:{dashedName}` and `draft:challenge:{id}`.

Each draft record contains:

- `updatedAt` -- ISO timestamp of last save
- `originalHash` -- djb2 hash of the original data (for drift detection)
- `patch` -- array of RFC 6902 JSON Patch operations

### Draft lifecycle

1. Open a block or challenge page
2. If a saved draft exists, it is applied on top of the current server data
3. Edit fields -- changes are held in memory (not written to localStorage on every keystroke)
4. Click **Save Draft** to persist to localStorage
5. Click **Discard Changes** to reset to original server data

### Drift detection

When the server data changes after a draft was created, the `originalHash` will not match. The UI shows a "Draft may be out of date" warning. The draft can still be viewed and edited.

## How to export/import patches

### Export

On the block detail page, click **Export Patch**. This downloads a JSON file containing:

```json
{
  "type": "block",
  "id": "basic-html",
  "updatedAt": "2025-01-15T10:30:00.000Z",
  "originalHash": "abc123",
  "patch": [{ "op": "replace", "path": "/helpCategory", "value": "JavaScript" }]
}
```

### Import

Click **Import Patch** and select a previously exported JSON file. The patch operations are applied to the current server data and loaded into the editor. You can then review and save the draft.

## Schema assumptions

- `Challenge.content` always returns `null` in MVP. The UI shows "Content not available in MVP".
- `Block.blockLabel` is nullable (some blocks do not have a label).
- `Block.usesMultifileEditor` and `Block.hasEditableBoundaries` are nullable booleans.
- `Block.superblocks` returns parent superblocks (blocks can be shared across superblocks in v9).
- The GraphQL schema uses `BlockLabel` (not `BlockType`) for pedagogical classification.

## Validation rules

- `block.helpCategory` must be non-empty
- `challenge.title` must be non-empty
- `challengeOrder` must not contain duplicate challenge IDs
- Enum selects only allow valid values (enforced by the UI)
- Saving a draft is blocked when validation fails

## GraphQL Code Generation

The codegen config (`codegen.ts`) points to the server's GraphQL schema file. Running `pnpm codegen` generates typed document nodes in `src/graphql/generated/`. This is optional -- the app uses manually maintained types in `src/graphql/types.ts` by default.

## Follow-up improvements (MVP2)

- **Mutations**: persist edits to the server via GraphQL mutations
- **Review workflow**: draft approval flow with multiple reviewers
- **Authentication**: user login and role-based permissions
- **Drag-and-drop**: replace up/down buttons with drag-and-drop reorder (e.g. @dnd-kit)
- **Undo/redo**: operation history for draft edits
- **Collaborative editing**: real-time multi-user editing with conflict resolution
- **Challenge content**: display and edit challenge descriptions, instructions, and tests
- **Search**: global search across all blocks and challenges
