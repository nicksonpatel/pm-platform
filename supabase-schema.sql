-- =============================================
-- ClickUp-Style PM Platform - Supabase Schema v2
-- Includes Auth + Team Invites
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

-- User Profiles (extends auth.users)
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Workspace Members (who belongs to which workspace)
create table workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(workspace_id, user_id)
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

-- Lists
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
  assignee_id uuid references auth.users(id) on delete set null,
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
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Workspace Invites
create table workspace_invites (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid references auth.users(id) on delete set null,
  token text unique not null,
  accepted boolean default false,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table workspaces enable row level security;
alter table user_profiles enable row level security;
alter table workspace_members enable row level security;
alter table projects enable row level security;
alter table lists enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;
alter table workspace_invites enable row level security;

-- User Profiles: Users can read all profiles, update only their own
create policy "Users can read all profiles" on user_profiles for select using (true);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = id);

-- Workspaces: Members can read their workspaces
create policy "Members can read workspaces" on workspaces for select 
  using (id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "Users can create workspaces" on workspaces for insert with check (true);

-- Workspace Members: Members can read member list
create policy "Members can read workspace members" on workspace_members for select
  using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "Workspace owners/admins can manage members" on workspace_members for all
  using (
    workspace_id in (
      select workspace_id from workspace_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Projects: Members can read projects in their workspaces
create policy "Members can read projects" on projects for select
  using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "Members can create projects" on projects for insert
  with check (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

create policy "Members can update projects" on projects for update
  using (workspace_id in (select workspace_id from workspace_members where user_id = auth.uid()));

-- Lists: Members can read lists in their projects
create policy "Members can read lists" on lists for select
  using (project_id in (
    select p.id from projects p 
    join workspace_members wm on p.workspace_id = wm.workspace_id 
    where wm.user_id = auth.uid()
  ));

create policy "Members can manage lists" on lists for all
  using (project_id in (
    select p.id from projects p 
    join workspace_members wm on p.workspace_id = wm.workspace_id 
    where wm.user_id = auth.uid()
  ));

-- Tasks: Members can read tasks in their projects
create policy "Members can read tasks" on tasks for select
  using (list_id in (
    select l.id from lists l
    join projects p on l.project_id = p.id
    join workspace_members wm on p.workspace_id = wm.workspace_id
    where wm.user_id = auth.uid()
  ));

create policy "Members can manage tasks" on tasks for all
  using (list_id in (
    select l.id from lists l
    join projects p on l.project_id = p.id
    join workspace_members wm on p.workspace_id = wm.workspace_id
    where wm.user_id = auth.uid()
  ));

-- Comments: Members can read/write comments on their tasks
create policy "Members can read comments" on comments for select
  using (task_id in (
    select t.id from tasks t
    join lists l on t.list_id = l.id
    join projects p on l.project_id = p.id
    join workspace_members wm on p.workspace_id = wm.workspace_id
    where wm.user_id = auth.uid()
  ));

create policy "Members can create comments" on comments for insert
  with check (user_id = auth.uid());

create policy "Members can delete own comments" on comments for delete
  using (user_id = auth.uid());

-- Invites: Anyone with token can read invite, admins can create
create policy "Anyone can read invite by token" on workspace_invites for select
  using (true);

create policy "Members can create invites" on workspace_invites for insert
  with check (
    workspace_id in (
      select workspace_id from workspace_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Users can accept invites" on workspace_invites for update
  using (accepted = false);

-- =============================================
-- REALTIME
-- =============================================

alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table lists;
alter publication supabase_realtime add table workspace_members;

-- =============================================
-- HELPER FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger workspaces_updated_at before update on workspaces for each row execute function update_updated_at();
create trigger projects_updated_at before update on projects for each row execute function update_updated_at();
create trigger lists_updated_at before update on lists for each row execute function update_updated_at();
create trigger tasks_updated_at before update on tasks for each row execute function update_updated_at();

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
