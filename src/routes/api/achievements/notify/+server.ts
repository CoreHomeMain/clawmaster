import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { markAchievementNotified } from '$lib/server/achievements'

/**
 * POST /api/achievements/notify
 * Mark achievements as notified
 * Body: { achievementIds: string[] }
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) throw error(401, 'Unauthorized')

  const { achievementIds } = await request.json()

  if (!Array.isArray(achievementIds)) {
    throw error(400, 'achievementIds must be an array')
  }

  const results = await Promise.all(
    achievementIds.map(id => markAchievementNotified(locals.supabase, id))
  )

  return json({ success: results.every(r => r), notified: results.length })
}
