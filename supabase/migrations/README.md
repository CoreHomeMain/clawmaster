# Supabase Migrations

## Applying the Migration

1. Go to: https://supabase.com/dashboard/project/hatwvhqjplvlcqrddmif/sql/new
2. Copy and paste the contents of `001_initial_schema.sql`
3. Click "Run"

Also apply the user_profiles trigger (auto-create profile on signup):

```sql
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
```
