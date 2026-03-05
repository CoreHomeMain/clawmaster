-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- USER PROFILES (extends Supabase auth.users)
-- =============================================
create table if not exists user_profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  level text default 'beginner' check (level in ('beginner','intermediate','advanced','expert')),
  xp integer default 0 check (xp >= 0),
  credits integer default 100 check (credits >= 0),
  onboarding_complete boolean default false,
  onboarding_data jsonb,
  openrouter_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- LEARNING PATHS
-- =============================================
create table if not exists learning_paths (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  description text,
  level text check (level in ('beginner','intermediate','advanced')),
  modules_order uuid[],
  created_at timestamptz default now()
);

-- =============================================
-- MODULES
-- =============================================
create table if not exists modules (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  description text,
  content_mdx text,
  level text default 'beginner' check (level in ('beginner','intermediate','advanced')),
  order_index integer default 0,
  path_id uuid references learning_paths on delete set null,
  xp_reward integer default 10 check (xp_reward >= 0),
  estimated_minutes integer default 10,
  created_at timestamptz default now()
);

-- =============================================
-- USER PROGRESS
-- =============================================
create table if not exists user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles on delete cascade,
  module_id uuid references modules on delete cascade,
  status text default 'not_started' check (status in ('not_started','in_progress','completed')),
  progress_pct integer default 0 check (progress_pct between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, module_id)
);

-- =============================================
-- ACHIEVEMENTS
-- =============================================
create table if not exists achievements (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  title text not null,
  description text,
  icon text,
  xp_reward integer default 10
);

create table if not exists user_achievements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles on delete cascade,
  achievement_id uuid references achievements on delete cascade,
  earned_at timestamptz default now(),
  unique(user_id, achievement_id)
);

-- =============================================
-- AI CONVERSATIONS
-- =============================================
create table if not exists conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles on delete cascade,
  title text,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references conversations on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  credits_used integer default 0,
  model text,
  created_at timestamptz default now()
);

-- =============================================
-- PURCHASES
-- =============================================
create table if not exists purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles on delete cascade,
  paypal_order_id text unique,
  amount_usd numeric(10,2),
  credits_added integer,
  product_type text check (product_type in ('starter','credit_pack_s','credit_pack_m','credit_pack_l')),
  status text default 'pending' check (status in ('pending','completed','refunded')),
  created_at timestamptz default now()
);

-- =============================================
-- SEED DATA: ACHIEVEMENTS
-- =============================================
insert into achievements (slug, title, description, icon, xp_reward) values
  ('welcome', 'Welcome to ClawMaster', 'You joined the platform', '🦞', 10),
  ('know_your_level', 'Know Your Level', 'Completed the onboarding quiz', '🎯', 20),
  ('first_steps', 'First Steps', 'Completed your first module', '📚', 25),
  ('gateway_online', 'Gateway Online', 'Completed the Gateway module', '⚡', 50),
  ('first_chat', 'First Chat', 'Completed AI Conversation module', '💬', 50),
  ('connected', 'Connected', 'Completed a channel setup module', '🔌', 75),
  ('ai_curious', 'AI Curious', 'Sent first message to ClawBot', '🤖', 25),
  ('memory_master', 'Memory Master', 'Completed the Memory System module', '🧠', 50),
  ('multi_agent', 'Multi-Agent', 'Completed Multi-Agent Routing module', '👥', 100),
  ('path_complete', 'Path Complete', 'Completed all modules in a learning path', '🏆', 200)
on conflict (slug) do nothing;

-- =============================================
-- SEED DATA: LEARNING PATHS
-- =============================================
insert into learning_paths (id, slug, title, description, level) values
  ('00000000-0000-0000-0000-000000000001', 'beginner', 'Beginner Path', 'Start your OpenClaw journey from scratch', 'beginner'),
  ('00000000-0000-0000-0000-000000000002', 'intermediate', 'Intermediate Path', 'Level up your OpenClaw configuration', 'intermediate'),
  ('00000000-0000-0000-0000-000000000003', 'advanced', 'Advanced Path', 'Master skills and automation', 'advanced')
on conflict (slug) do nothing;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table user_profiles enable row level security;
alter table user_progress enable row level security;
alter table user_achievements enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table purchases enable row level security;
alter table modules enable row level security;
alter table learning_paths enable row level security;
alter table achievements enable row level security;

-- user_profiles policies
create policy "Users can view own profile" on user_profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on user_profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on user_profiles for insert with check (auth.uid() = id);
create policy "Service role full access to profiles" on user_profiles for all using (auth.role() = 'service_role');

-- user_progress policies
create policy "Users can manage own progress" on user_progress for all using (auth.uid() = user_id);

-- user_achievements policies
create policy "Users can view own achievements" on user_achievements for all using (auth.uid() = user_id);

-- conversations policies
create policy "Users can manage own conversations" on conversations for all using (auth.uid() = user_id);

-- messages policies
create policy "Users can view own messages" on messages for all using (
  auth.uid() = (select user_id from conversations where id = conversation_id)
);

-- purchases policies
create policy "Users can view own purchases" on purchases for all using (auth.uid() = user_id);

-- Public read for modules, paths, achievements (anyone can browse)
create policy "Public read modules" on modules for select using (true);
create policy "Admin write modules" on modules for all using (auth.role() = 'service_role');
create policy "Public read paths" on learning_paths for select using (true);
create policy "Public read achievements" on achievements for select using (true);

-- =============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_user_profiles_updated
  before update on user_profiles
  for each row execute procedure handle_updated_at();

-- =============================================
-- USER PROFILE TRIGGER (auto-create on signup)
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
