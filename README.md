# PM Platform

A ClickUp-style project management platform built with Next.js, ShadCN/UI, and Supabase.

## Features

- **Multiple Workspaces** - Organize projects by workspace
- **Projects** - Create projects with custom colors and icons
- **Lists** - Group tasks into lists (Backlog, In Progress, Review, Done, etc.)
- **Tasks** - Full task management with statuses, priorities, due dates, assignees
- **Views** - Board (Kanban), List, and Calendar views
- **Comments** - Task-level comments for collaboration
- **Demo Mode** - Works with mock data when Supabase is not configured

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: ShadCN/UI
- **Backend**: Supabase (PostgreSQL, Realtime)
- **State Management**: React Context + Hooks

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase (Optional - runs in demo mode without)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials

```bash
cp .env.local.example .env.local
```

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Supabase Schema

The database schema is in `supabase-schema.sql`. It includes:

- `workspaces` - Top-level organization
- `projects` - Projects within workspaces
- `lists` - Task lists within projects
- `tasks` - Individual tasks with status, priority, due dates
- `comments` - Task comments

Run this in your Supabase SQL Editor to set up the database.

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/
│   ├── board/        # Board, List, Calendar views + TaskCard
│   ├── layout/       # Sidebar, Header, WelcomeScreen
│   └── ui/           # ShadCN components
└── lib/
    ├── mock-data.ts  # Demo mode data
    ├── store.tsx     # App state context
    ├── supabase.ts   # Supabase client
    └── types.ts      # TypeScript types
```
