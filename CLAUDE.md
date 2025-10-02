# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a pnpm workspace monorepo using Turborepo for task orchestration. The workspace consists of:

- `apps/web` - Next.js 15 application with React 19, using Turbopack for dev mode
- `packages/ui` - Shared shadcn/ui components library with Tailwind CSS v4
- `packages/eslint-config` - Shared ESLint configuration
- `packages/typescript-config` - Shared TypeScript configurations

The UI package exports components, utilities, hooks, and styles to be consumed by apps via workspace protocol.

## Common Commands

### Root-level (uses Turborepo)
- `pnpm dev` - Start all apps in dev mode (Next.js uses Turbopack)
- `pnpm build` - Build all apps and packages (respects dependency graph)
- `pnpm lint` - Run ESLint across all packages
- `pnpm format` - Format all TypeScript/TSX/MD files with Prettier

### Web App (apps/web/)
- `pnpm --filter web dev` - Start Next.js dev server with Turbopack
- `pnpm --filter web build` - Build Next.js app for production
- `pnpm --filter web start` - Start production server
- `pnpm --filter web lint` - Run Next.js linting
- `pnpm --filter web lint:fix` - Auto-fix linting issues
- `pnpm --filter web typecheck` - Run TypeScript type checking

### UI Package (packages/ui/)
- `pnpm --filter @workspace/ui lint` - Run ESLint on UI package

### Adding shadcn/ui Components
Run from the web app directory or use the `-c` flag:
```bash
pnpm dlx shadcn@latest add <component-name> -c apps/web
```
This places components in `packages/ui/src/components/` for shared use across all apps.

## Architecture

### Component Import Pattern
Components from the UI package are imported using workspace aliases:
```tsx
import { Button } from "@workspace/ui/components/button"
```

The UI package uses `exports` in package.json to expose:
- Components: `@workspace/ui/components/*`
- Utilities: `@workspace/ui/lib/*`
- Hooks: `@workspace/ui/hooks/*`
- Styles: `@workspace/ui/globals.css`
- PostCSS config: `@workspace/ui/postcss.config`

### Tailwind Configuration
- Tailwind CSS v4 is used with `@tailwindcss/postcss`
- Global styles are in `packages/ui/src/styles/globals.css`
- The web app imports these styles and shares the Tailwind configuration
- Components use CSS variables for theming (baseColor: neutral)

### shadcn/ui Setup
Both the web app and UI package have `components.json` configurations:
- Web app points CSS to `../../packages/ui/src/styles/globals.css`
- UI package uses `src/styles/globals.css`
- Style: "new-york"
- Icon library: lucide-react
- RSC enabled, TSX enabled, CSS variables enabled

### Turborepo Task Pipeline
- `build` depends on upstream builds (`^build`)
- `lint` and `check-types` follow dependency order
- `dev` has no caching and is persistent
- Build outputs cached in `.next/` (excluding cache folder)

## Package Manager
- Uses pnpm v10.4.1 (required)
- Node.js >= 20 required
- Workspace packages referenced via `workspace:*` protocol
