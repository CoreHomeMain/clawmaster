import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) return { achievements: [], earned: [], totalXp: 0 }

  const [allRes, earnedRes] = await Promise.all([
    locals.supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true }),
    locals.supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
  ])

  const earned = earnedRes.data || []
  const earnedIds = new Set(earned.map((e: any) => e.achievement_id))
  const totalXp = earned.reduce((sum: number, e: any) => sum + (e.achievement?.xp_reward || 0), 0)

  return {
    achievements: allRes.data || [],
    earned,
    earnedIds: [...earnedIds],
    totalXp
  }
}
