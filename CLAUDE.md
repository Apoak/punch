# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install deps, generate Prisma client, run migrations
npm run setup

# Development server (Next.js + Turbopack)
npm run dev

# Background dev server (logs to logs.txt)
npm run dev:daemon

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Reset database
npm run db:reset

# Lint
npm run lint
```

Set `ANTHROPIC_API_KEY` in `.env` to enable real AI generation. Without it, the app runs in mock mode (returns hardcoded demo components).

## Architecture

### Request Flow

1. User types in `ChatInterface` → `useChat` (Vercel AI SDK) POSTs to `/api/chat` with messages + serialized VFS state
2. `/api/chat/route.ts` calls Claude (`streamText`) with two tools and streams the response back
3. As tool calls arrive, `FileSystemProvider` processes them and mutates the in-memory `VirtualFileSystem`
4. `PreviewFrame` detects VFS changes (via `refreshTrigger`) and rebuilds the iframe HTML

### Virtual File System

`src/lib/file-system.ts` — In-memory tree of `FileNode` objects. No files are written to disk. State is serialized to JSON and stored in `Project.data` (SQLite via Prisma) on each chat completion.

The VFS is exposed via `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`), which also processes incoming AI tool calls.

### Live Preview Pipeline

`src/lib/transform/jsx-transformer.ts` runs entirely in the browser:
1. Each JSX/TSX file is transformed via `@babel/standalone` → plain JS
2. A native browser `importmap` is built: React/ReactDOM → `esm.sh`, local files → blob URLs, third-party packages → `esm.sh/<package>`
3. CSS imports are stripped from JS and injected as `<style>` tags
4. Missing local imports get placeholder stub modules so the preview doesn't crash
5. The entry point (`/App.jsx` by default) is loaded via `<script type="module">` inside an iframe

### AI Tools

Two tools are registered in `/api/chat/route.ts`:
- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — `view`, `create`, `str_replace`, `insert`
- `file_manager` (`src/lib/tools/file-manager.ts`) — `rename`, `delete`

The system prompt (`src/lib/prompts/generation.tsx`) instructs Claude to:
- Always create `/App.jsx` as the entry point
- Use `@/` alias for all internal imports (e.g. `@/components/Button`)
- Style with Tailwind, never hardcoded styles
- Never create HTML files

### Authentication

JWT sessions via Jose stored in a cookie (7-day expiry). `src/lib/auth.ts` handles session creation/verification. Passwords hashed with bcrypt (10 rounds). Middleware at `src/middleware.ts` verifies sessions on API routes.

Anonymous users can generate components freely; their work is tracked in `sessionStorage` (`src/lib/anon-work-tracker.ts`) and migrated to a real `Project` on sign-up via `useAuth` (`src/hooks/use-auth.ts`).

### Data Persistence

The database schema is defined in `prisma/schema.prisma`. Reference it anytime you need to understand the structure of the data stored in the database.



```prisma
Project {
  messages  String  // JSON: Vercel AI SDK message array
  data      String  // JSON: serialized VirtualFileSystem nodes
}
```

Projects auto-save after each chat completion in the `onFinish` callback of `streamText`.

### Mock Mode

`src/lib/provider.ts` returns a `MockLanguageModel` when `ANTHROPIC_API_KEY` is absent. It emits hardcoded tool calls that create a demo Counter, Form, or Card component with simulated streaming delays. Useful for UI/UX development without an API key.

### Testing

Tests use Vitest + jsdom + `@vitejs/plugin-react`. Test files live in `__tests__/` subdirectories next to the code they test. The `@/` path alias works in tests via `vite-tsconfig-paths`.
