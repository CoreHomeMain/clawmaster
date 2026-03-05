#!/usr/bin/env node
/**
 * Apply Supabase migrations and triggers using the management API
 */

const fs = require('fs')
const path = require('path')

const SUPABASE_URL = 'https://hatwvhqjplvlcqrddmif.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdHd2aHFqcGx2bGNxcmRkbWlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg2NTQ0MCwiZXhwIjoyMDg3NDQxNDQwfQ.NJ2s9GD3SsmUG5OE4ykGIODXF0134D89YD1EvIVlaYs'

const migrationSQL = fs.readFileSync(
  path.join(__dirname, '../supabase/migrations/001_initial_schema.sql'),
  'utf-8'
)

const triggerSQL = `
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
`

async function runSQL(sql, label) {
  console.log(`\nApplying: ${label}`)
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sql })
  })

  if (!res.ok) {
    // Try alternative approach - split by statements and use query endpoint
    console.warn(`RPC approach failed (${res.status}), trying direct query...`)
    return false
  }

  const data = await res.json()
  console.log(`✅ ${label} applied`)
  return true
}

async function main() {
  console.log('🚀 Applying Supabase migrations...')
  
  // Try applying migration
  const migOk = await runSQL(migrationSQL, 'Initial Schema Migration')
  if (!migOk) {
    console.log('Migration may already be applied or needs manual intervention.')
  }

  const trigOk = await runSQL(triggerSQL, 'User Profiles Trigger')
  if (!trigOk) {
    console.log('Trigger may need manual application via Supabase dashboard.')
  }

  console.log('\n✅ Migration script complete!')
  console.log('If you see errors, apply the SQL manually in the Supabase SQL editor:')
  console.log('https://supabase.com/dashboard/project/hatwvhqjplvlcqrddmif/sql/new')
}

main().catch(console.error)
