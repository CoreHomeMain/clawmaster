import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const { user } = await locals.safeGetSession()
  if (!user) return {}

  const [profileRes, progressRes, achievementsRes] = await Promise.all([
    locals.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    locals.supabase
      .from('user_progress')
      .select('*, module:modules(slug, title, level, estimated_minutes)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    locals.supabase
      .from('user_achievements')
      .select('*, achievement:achievements(title, icon, description)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(5)
  ])

  const profile = profileRes.data
  const progress = progressRes.data || []
  const achievements = achievementsRes.data || []

  // Find last in-progress module
  const lastInProgress = progress.find(p => p.status === 'in_progress')

  // XP needed for next level
  const XP_THRESHOLDS = { beginner: 0, intermediate: 500, advanced: 1500 }
  const currentXp = profile?.xp || 0
  const level = profile?.level || 'beginner'
  const nextLevel = level === 'beginner' ? 'intermediate' : level === 'intermediate' ? 'advanced' : 'expert'
  const xpForNext = level === 'beginner' ? 500 : level === 'intermediate' ? 1500 : 3000
  const xpProgress = Math.min(100, (currentXp / xpForNext) * 100)

  return {
    profile,
    progress,
    achievements,
    lastInProgress,
    xpProgress,
    xpForNext,
    nextLevel,
    email: user.email
  }
}
