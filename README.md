# PM Platform

A ClickUp-style project management platform built with Next.js, ShadCN/UI, and Supabase.

## Features

- **Multiple Workspaces** - Organize projects by workspace
- **Projects** - Create projects with custom colors and icons
- **Lists** - Group tasks into lists (Backlog, In Progress, Review, Done, etc.)
- **Tasks** - Full task management with statuses, priorities, due dates, assignees
- **Views** - Board (Kanban), List, and Calendar views
- **Comments** - Task-level comments for collaboration
- **Team Auth** - Email/password signup and login
- **Team Invites** - Invite teammates to your workspace with invite links

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **UI Components**: ShadCN/UI (Base UI)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: React Context + Hooks

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase (Optional - runs in demo mode without)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker Deployment

```bash
docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key -t pm-platform .
docker run -d -p 3000:3000 pm-platform
```

Or use docker-compose:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key docker-compose up -d
```

## Supabase Schema

The database schema is in `supabase-schema.sql`. It includes:

- `workspaces` - Top-level organization
- `user_profiles` - User profiles linked to auth.users
- `workspace_members` - Workspace membership with roles (owner/admin/member)
- `workspace_invites` - Invite system for teammates
- `projects` - Projects within workspaces
- `lists` - Task lists within projects
- `tasks` - Individual tasks with status, priority, due dates
- `comments` - Task comments

Run this in your Supabase SQL Editor to set up the database.

## Authentication

The app uses Supabase Auth with email/password:

- **Sign Up**: Creates account + auto-creates personal workspace
- **Sign In**: Access your workspaces and projects
- **Invite**: Workspace owners/admins can invite teammates via email

### Invite Flow

1. Workspace owner/admin clicks "Invite" button
2. Enters teammate's email and role (Admin/Member)
3. Invite link is copied to clipboard
4. Teammate opens link, signs up/logs in, and joins the workspace

## Project Structure

```
src/
├── app/
│   ├── auth/           # Login/Register page
│   ├── invite/[token]/ # Accept invite page
│   ├── layout.tsx     # Root layout with providers
│   └── providers.tsx  # Auth + App context providers
├── components/
│   ├── board/          # Board, List, Calendar views + TaskCard
│   ├── layout/         # Sidebar, Header, WelcomeScreen
│   ├── workspace/      # InviteModal
│   └── ui/            # ShadCN components
└── lib/
    ├── auth.ts         # Supabase auth helpers
    ├── auth-context.tsx # Auth state context
    ├── mock-data.ts    # Demo mode data
    ├── store.tsx       # App state context
    ├── supabase.ts     # Supabase client
    └── types.ts        # TypeScript types
```
