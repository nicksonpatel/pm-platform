-- =============================================
-- ClickUp-Style PM Platform - Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Workspaces
create table workspaces (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  description text,
  color text default '#6366f1',
  icon text default '📁',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Lists (like folders in ClickUp)
create table lists (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tasks
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid references lists(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'in_progress', 'in review', 'done', 'cancelled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  assignee_id text,
  assignee_name text,
  assignee_avatar text,
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments
create table comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id text not null,
  user_name text not null,
  user_avatar text,
  content text not null,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table workspaces enable row level security;
alter table projects enable row level security;
alter table lists enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;

-- Public read/write for demo (adjust for production)
-- Workspaces
create policy "Public workspaces" on workspaces for all using (true) with check (true);

-- Projects
create policy "Public projects" on projects for all using (true) with check (true);

-- Lists
create policy "Public lists" on lists for all using (true) with check (true);

-- Tasks
create policy "Public tasks" on tasks for all using (true) with check (true);

-- Comments
create policy "Public comments" on comments for all using (true) with check (true);

-- =============================================
-- REALTIME
-- =============================================

alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table lists;
alter publication supabase_realtime add table projects;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables
create trigger workspaces_updated_at before update on workspaces for each row execute function update_updated_at();
create trigger projects_updated_at before update on projects for each row execute function update_updated_at();
create trigger lists_updated_at before update on lists for each row execute function update_updated_at();
create trigger tasks_updated_at before update on tasks for each row execute function update_updated_at();
