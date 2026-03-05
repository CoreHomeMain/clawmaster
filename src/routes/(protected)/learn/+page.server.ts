import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession()

  const [modulesRes, progressRes, pathsRes] = await Promise.all([
    locals.supabase
      .from('modules')
      .select('*')
      .order('order_index', { ascending: true }),
    user
      ? locals.supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
      : Promise.resolve({ data: [], error: null }),
    locals.supabase
      .from('learning_paths')
      .select('*')
      .order('created_at', { ascending: true })
  ])

  return {
    modules: modulesRes.data || [],
    progress: progressRes.data || [],
    paths: pathsRes.data || []
  }
}
