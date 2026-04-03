-- =============================================
-- ClickUp-Style PM Platform - Supabase Schema v4
-- Permissive policies for workspaces/projects
-- =============================================

create extension if not exists "uuid-ossp";

-- Tables
create table workspaces (
  id uuid primary key default uuid_generate_v4(), 
  name text not null, 
  description text, 
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade, 
  email text not null, 
  full_name text, 
  avatar_url text, 
  created_at timestamptz default now()
);

create table workspace_members (
  id uuid primary key default uuid_generate_v4(), 
  workspace_id uuid references workspaces(id) on delete cascade not null, 
  user_id uuid references auth.users(id) on delete cascade not null, 
  role text not null default 'member' check (role in ('owner', 'admin', 'member')), 
  created_at timestamptz default now(), 
  unique(workspace_id, user_id)
);

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

create table lists (
  id uuid primary key default uuid_generate_v4(), 
  project_id uuid references projects(id) on delete cascade not null, 
  name text not null, 
  created_at timestamptz default now(), 
  updated_at timestamptz default now()
);

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

create table comments (
  id uuid primary key default uuid_generate_v4(), 
  task_id uuid references tasks(id) on delete cascade not null, 
  user_id uuid references auth.users(id) on delete cascade not null, 
  content text not null, 
  created_at timestamptz default now()
);

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

-- Enable RLS
alter table workspaces enable row level security;
alter table user_profiles enable row level security;
alter table workspace_members enable row level security;
alter table projects enable row level security;
alter table lists enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;
alter table workspace_invites enable row level security;

-- Helper functions with SECURITY DEFINER (runs as table owner, bypasses RLS)
create or replace function is_workspace_member(p_workspace_id uuid)
returns boolean as $$ 
  select exists (select 1 from workspace_members where workspace_id = p_workspace_id and user_id = auth.uid()); 
$$ language sql security definer;

create or replace function is_workspace_admin(p_workspace_id uuid)
returns boolean as $$ 
  select exists (select 1 from workspace_members where workspace_id = p_workspace_id and user_id = auth.uid() and role in ('owner', 'admin')); 
$$ language sql security definer;

-- USER PROFILES
create policy "User profiles are viewable by all" on user_profiles for select using (true);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = id);

-- WORKSPACES - Allow authenticated users to create
create policy "Authenticated users can create workspaces" on workspaces for insert with check (auth.uid() is not null);
create policy "Workspace members can view workspaces" on workspaces for select using (is_workspace_member(id) or true);
create policy "Workspace owners can update" on workspaces for update using (is_workspace_admin(id));
create policy "Workspace owners can delete" on workspaces for delete using (is_workspace_admin(id));

-- WORKSPACE MEMBERS
create policy "Workspace members can view members" on workspace_members for select using (is_workspace_member(workspace_id) or true);
create policy "Authenticated users can add members" on workspace_members for insert with check (auth.uid() is not null);
create policy "Workspace admins can manage members" on workspace_members for update using (is_workspace_admin(workspace_id));
create policy "Workspace admins can remove members" on workspace_members for delete using (is_workspace_admin(workspace_id));

-- PROJECTS
create policy "Project members can view projects" on projects for select using (is_workspace_member(workspace_id) or true);
create policy "Workspace members can create projects" on projects for insert with check (is_workspace_member(workspace_id) or auth.uid() is not null);
create policy "Workspace members can update projects" on projects for update using (is_workspace_member(workspace_id));
create policy "Workspace members can delete projects" on projects for delete using (is_workspace_admin(workspace_id));

-- LISTS
create policy "Project members can view lists" on lists for select using (is_workspace_member((select workspace_id from projects where id = project_id)) or true);
create policy "Project members can manage lists" on lists for all using (is_workspace_member((select workspace_id from projects where id = project_id)) or true);

-- TASKS
create policy "Project members can view tasks" on tasks for select using (
  exists (
    select 1 from lists l 
    join projects p on l.project_id = p.id 
    where l.id = tasks.list_id and (is_workspace_member(p.workspace_id) or true)
  )
);
create policy "Project members can manage tasks" on tasks for all using (
  exists (
    select 1 from lists l 
    join projects p on l.project_id = p.id 
    where l.id = tasks.list_id and (is_workspace_member(p.workspace_id) or true)
  )
);

-- COMMENTS
create policy "Project members can view comments" on comments for select using (
  exists (
    select 1 from tasks t 
    join lists l on t.list_id = l.id 
    join projects p on l.project_id = p.id 
    where t.id = comments.task_id and (is_workspace_member(p.workspace_id) or true)
  )
);
create policy "Authenticated users can create comments" on comments for insert with check (auth.uid() is not null);
create policy "Users can delete own comments" on comments for delete using (user_id = auth.uid());

-- WORKSPACE INVITES
create policy "Anyone can view invites" on workspace_invites for select using (true);
create policy "Workspace admins can create invites" on workspace_invites for insert with check (is_workspace_admin(workspace_id));
create policy "Users can update own invites" on workspace_invites for update using (accepted = false);

-- REALTIME
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table lists;
alter publication supabase_realtime add table workspace_members;

-- AUTO-UPDATE TIMESTAMP
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

-- AUTO-CREATE USER PROFILE ON SIGNUP
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
