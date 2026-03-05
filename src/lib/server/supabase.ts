import { createServerClient } from '@supabase/ssr'
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Cookies } from '@sveltejs/kit'

export function createSupabaseServerClient(cookies: Cookies) {
  return createServerClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, { ...options, path: '/' })
        })
      }
    }
  })
}

export function createSupabaseAdminClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
