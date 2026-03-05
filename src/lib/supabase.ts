import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Cookies } from '@sveltejs/kit'

export function createSupabaseClient() {
  return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)
}

export function createSupabaseServerClient(cookies: Cookies) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookies.set(name, value, { ...options, path: '/' })
        )
      }
    }
  })
}

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          level: string
          xp: number
          credits: number
          onboarding_complete: boolean
          onboarding_data: Record<string, unknown> | null
          openrouter_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      modules: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          content_mdx: string | null
          level: string
          order_index: number
          path_id: string | null
          xp_reward: number
          estimated_minutes: number
          created_at: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          status: string
          progress_pct: number
          completed_at: string | null
          created_at: string
        }
      }
      achievements: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          icon: string | null
          xp_reward: number
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          created_at: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          credits_used: number
          created_at: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          amount_usd: number
          credits_added: number
          paypal_order_id: string | null
          status: string
          created_at: string
        }
      }
    }
  }
}
