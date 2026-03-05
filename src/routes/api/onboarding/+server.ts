import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession()
  if (!session || !user) {
    throw error(401, 'Unauthorized')
  }

  const { answers, level } = await request.json()

  const { error: dbError } = await locals.supabase
    .from('user_profiles')
    .update({
      onboarding_data: answers,
      onboarding_complete: true,
      level: level || 'beginner'
    })
    .eq('id', user.id)

  if (dbError) {
    console.error('Onboarding save error:', dbError)
    throw error(500, 'Failed to save onboarding data')
  }

  return json({ success: true, level })
}
