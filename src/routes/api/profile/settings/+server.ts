import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) throw error(401, 'Unauthorized')

  const updates = await request.json()
  const allowed = ['openrouter_key', 'display_name', 'username']
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  )

  const { error: dbError } = await locals.supabase
    .from('user_profiles')
    .update(filtered)
    .eq('id', user.id)

  if (dbError) throw error(500, 'Failed to update settings')
  return json({ success: true })
}
