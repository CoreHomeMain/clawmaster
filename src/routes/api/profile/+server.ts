import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) throw error(401, 'Unauthorized')

  const { data } = await locals.supabase
    .from('user_profiles')
    .select('credits, xp, level, display_name')
    .eq('id', user.id)
    .single()

  return json(data || { credits: 0, xp: 0, level: 'beginner' })
}
