# APEX Architecture Documentation

## Project Structure Overview

The APEX project is a monorepo-style setup containing the following core components:

### 1. The Hub (`/apex-hub`)
The central dashboard and management interface.
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Zinc theme)
- **State Management**: React Server Components + Client Hooks (`ViewContext`)
- **Database Client**: Supabase JS Client (`@supabase/supabase-js`)
- **Animation**: Framer Motion (Fade-in, Layout Transitions)

**Key Components:**
- **ApexBar**: Floating navigation with Segmented View Switcher and Folder integration.
- **TweetFeed**: Adaptive feed supporting Grid (Masonry) and Compact (List) modes.
- **TweetCard/Row**: Specialized display components for different view modes.
- **SyncCenter**: Real-time data pipeline visualization.
- **CommandPalette**: Global search and action interface (`cmdk`).

**Key Directories:**
- `src/app`: App Router pages and layouts.
- `src/components`: Core UI components (TweetFeed, ApexBar, etc.).
- `src/context`: React Context providers (ViewContext).
- `src/lib`: Utility functions and external service clients.

### 2. The Shadow Probe (`/extension`) [Prototype]
A Chrome Extension for silent data collection.
- **Framework**: Plasmo
- **Mechanism**: `window.fetch` interception via Content Scripts.
- **Storage**: IndexedDB for local buffering.
- **Status**: Core interception logic implemented; HMR issues resolved.

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
