-- =============================================
-- ACHIEVEMENT SYSTEM ENHANCEMENT
-- =============================================

-- Add new columns to achievements table for MVP badges
alter table achievements
  add column if not exists trigger_type text,
  add column if not exists trigger_value text;

-- Create user_xp table for tracking XP progression
create table if not exists user_xp (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references user_profiles on delete cascade unique,
  total_xp integer default 0 check (total_xp >= 0),
  level integer default 1 check (level >= 1),
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Add notified column to user_achievements for notification tracking
alter table user_achievements
  add column if not exists notified boolean default false;

-- Create indexes for better query performance
create index if not exists idx_user_achievements_user_id on user_achievements(user_id);
create index if not exists idx_user_achievements_achievement_id on user_achievements(achievement_id);
create index if not exists idx_user_xp_user_id on user_xp(user_id);

-- Enable RLS on user_xp
alter table user_xp enable row level security;

-- RLS policies for user_xp
create policy "Users can view own xp" on user_xp for select using (auth.uid() = user_id);
create policy "Service role full access to user_xp" on user_xp for all using (auth.role() = 'service_role');

-- =============================================
-- SEED DATA: 10 MVP BADGES
-- =============================================

-- Clear existing achievements (except existing ones) and insert MVP badges
delete from achievements where slug in (
  'first-steps', 'quick-learner', 'knowledge-seeker', 'clawmaster-student',
  'first-login', 'dedicated-learner', 'early-adopter', 'channel-master',
  'gateway-pro', 'ai-explorer'
);

insert into achievements (slug, title, description, icon, xp_reward, trigger_type, trigger_value) values
  ('first-steps', 'First Steps', 'Complete your first module', '👣', 50, 'module_complete', '1'),
  ('quick-learner', 'Quick Learner', 'Complete 5 modules', '⚡', 150, 'module_complete', '5'),
  ('knowledge-seeker', 'Knowledge Seeker', 'Complete 10 modules', '📚', 300, 'module_complete', '10'),
  ('clawmaster-student', 'ClawMaster Student', 'Complete all 15 modules', '🎓', 500, 'module_complete', '15'),
  ('first-login', 'First Login', 'Log in for the first time', '🔓', 25, 'login_count', '1'),
  ('dedicated-learner', 'Dedicated Learner', 'Log in 7 days in a row', '🔥', 200, 'streak_days', '7'),
  ('early-adopter', 'Early Adopter', 'Join during beta', '🌱', 100, 'signup_before', '2026-06-01'),
  ('channel-master', 'Channel Master', 'Configure all 3 channels', '📡', 250, 'channels_configured', '3'),
  ('gateway-pro', 'Gateway Pro', 'Set up the gateway', '🚀', 150, 'gateway_configured', '1'),
  ('ai-explorer', 'AI Explorer', 'Chat with ClawBot 10 times', '🤖', 100, 'clawbot_messages', '10')
on conflict (slug) do update set
  trigger_type = excluded.trigger_type,
  trigger_value = excluded.trigger_value,
  xp_reward = excluded.xp_reward;

-- =============================================
-- AUTO-CREATE USER_XP ON PROFILE CREATION
-- =============================================
create or replace function handle_new_user_xp()
returns trigger as $$
begin
  insert into user_xp (user_id, total_xp, level)
  values (new.id, 0, 1)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_user_profile_created_xp on user_profiles;
create trigger on_user_profile_created_xp
  after insert on user_profiles
  for each row execute procedure handle_new_user_xp();

-- =============================================
-- TRIGGER TO UPDATE USER_XP WHEN XP CHANGES
-- =============================================
create or replace function update_user_xp_on_profile_change()
returns trigger as $$
begin
  -- When profile xp changes, update user_xp table
  if new.xp != old.xp then
    update user_xp
    set total_xp = new.xp,
        level = floor(new.xp / 500) + 1,
        updated_at = now()
    where user_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_xp_updated on user_profiles;
create trigger on_profile_xp_updated
  after update on user_profiles
  for each row execute procedure update_user_xp_on_profile_change();
