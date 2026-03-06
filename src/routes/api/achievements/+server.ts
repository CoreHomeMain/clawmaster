import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import {
  checkAndAwardAchievements,
  getUserXP,
  markAchievementNotified,
  getAchievementsWithStatus,
  getUnnotifiedAchievements
} from '$lib/server/achievements'

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) throw error(401, 'Unauthorized')

  const { achievements, earned, earnedIds } = await getAchievementsWithStatus(
    locals.supabase,
    user.id
  )

  return json({
    all: achievements,
    earned,
    earnedIds: [...earnedIds]
  })
}

/**
 * POST /api/achievements/check
 * Check and award eligible achievements for current user
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) throw error(401, 'Unauthorized')

  const { triggerType, triggerValue } = await request.json()

  if (!triggerType || triggerValue === undefined) {
    throw error(400, 'Missing triggerType or triggerValue')
  }

  const awarded = await checkAndAwardAchievements(locals.supabase, user.id, triggerType, triggerValue)

  return json({ awarded })
}
