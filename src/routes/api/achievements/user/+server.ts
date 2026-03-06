import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getUserXP, getUnnotifiedAchievements } from '$lib/server/achievements'

export const GET: RequestHandler = async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) throw error(401, 'Unauthorized')

  const xpData = await getUserXP(locals.supabase, user.id)
  const unnotified = await getUnnotifiedAchievements(locals.supabase, user.id)

  return json({
    totalXp: xpData?.total_xp || 0,
    level: xpData?.level || 1,
    unnotified
  })
}
