import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession()

  if (!user) return { credits: 0, userOpenrouterKey: null }

  const { data: profile } = await locals.supabase
    .from('user_profiles')
    .select('credits, openrouter_key')
    .eq('id', user.id)
    .single()

  return {
    credits: profile?.credits || 0,
    userOpenrouterKey: profile?.openrouter_key || null
  }
}
