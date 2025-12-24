# APEX Architecture Documentation

## Project Structure Overview

The APEX project is a monorepo-style setup containing the following core components:

### 1. The Hub (`/apex-hub`)
The central dashboard and management interface.
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Zinc theme)
- **State Management**: React Server Components + Client Hooks
- **Database Client**: Supabase JS Client (`@supabase/supabase-js`)
- **Animation**: Framer Motion

**Key Directories:**
- `src/app`: App Router pages and layouts.
- `src/components/ui`: Reusable UI components (shadcn).
- `src/lib`: Utility functions and external service clients (Supabase, OpenAI).

### 2. The Shadow Probe (`/extension`) [Planned]
A Chrome Extension for silent data collection.
- **Framework**: Plasmo
- **Mechanism**: `window.fetch` interception via Content Scripts.
- **Storage**: IndexedDB for local buffering.

### 3. The Brain (Supabase) [External]
- **Database**: PostgreSQL
- **Vector Search**: pgvector
- **Realtime**: Supabase Realtime

## Data Flow

1. **Ingestion**: User actions (Like/Bookmark) on X.com -> Extension Interceptor -> IndexedDB -> Background Worker -> Supabase.
2. **Processing**: Supabase Trigger/Edge Function -> OpenAI Embedding -> Vector Store.
3. **Consumption**: Next.js Dashboard -> Supabase Client (Realtime) -> UI Updates.

## Design Decisions

- **Monorepo-ish**: Keeping `apex-hub` and `extension` (planned) in the same root for easier context sharing, though they are separate NPM projects.
- **Tailwind v4**: Using the latest Tailwind version for better performance and simplified config.
- **Strict TypeScript**: Enforcing type safety across the entire stack.
