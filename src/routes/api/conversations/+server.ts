import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession()
  if (!session || !user) throw error(401, 'Unauthorized')

  const { title } = await request.json()

  const { data, error: dbError } = await locals.supabase
    .from('conversations')
    .insert({ user_id: user.id, title: title || 'New conversation' })
    .select()
    .single()

  if (dbError) throw error(500, 'Failed to create conversation')
  return json(data)
}
