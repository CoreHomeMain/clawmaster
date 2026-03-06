import type { SupabaseClient } from '@supabase/supabase-js'

export interface Achievement {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  xp_reward: number
  trigger_type: string | null
  trigger_value: string | null
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  notified: boolean
}

export interface UserXP {
  id: string
  user_id: string
  total_xp: number
  level: number
  updated_at: string
  created_at: string
}

/**
 * Get user's total XP and current level
 */
export async function getUserXP(supabase: SupabaseClient, userId: string): Promise<UserXP | null> {
  const { data, error } = await supabase
    .from('user_xp')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user XP:', error)
    return null
  }

  return data
}

/**
 * Calculate level from XP (level = floor(xp/500) + 1)
 */
export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 500) + 1
}

/**
 * Award an achievement to a user
 */
export async function awardAchievement(
  supabase: SupabaseClient,
  userId: string,
  achievementId: string
): Promise<{ success: boolean; xpAwarded?: number }> {
  // Insert user achievement
  const { error: insertError } = await supabase
    .from('user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
      notified: false
    })

  if (insertError) {
    console.error('Error awarding achievement:', insertError)
    return { success: false }
  }

  // Get achievement details
  const { data: achievement } = await supabase
    .from('achievements')
    .select('xp_reward')
    .eq('id', achievementId)
    .single()

  if (!achievement) {
    return { success: true, xpAwarded: 0 }
  }

  // Add XP to user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('xp')
    .eq('id', userId)
    .single()

  if (profile) {
    const newXp = (profile.xp || 0) + achievement.xp_reward
    await supabase
      .from('user_profiles')
      .update({ xp: newXp })
      .eq('id', userId)
  }

  return { success: true, xpAwarded: achievement.xp_reward }
}

/**
 * Mark an achievement as notified
 */
export async function markAchievementNotified(
  supabase: SupabaseClient,
  userAchievementId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('user_achievements')
    .update({ notified: true })
    .eq('id', userAchievementId)

  return !error
}

/**
 * Check and award eligible achievements based on trigger type and value
 */
export async function checkAndAwardAchievements(
  supabase: SupabaseClient,
  userId: string,
  triggerType: string,
  triggerValue: string | number
): Promise<Achievement[]> {
  // Get all achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')

  if (!allAchievements) return []

  // Get user's existing achievements
  const { data: userAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const earnedIds = new Set((userAchievements || []).map(ua => ua.achievement_id))

  // Find achievements that match the trigger and haven't been earned
  const toAward: Achievement[] = []

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue // Already earned
    if (!achievement.trigger_type) continue // No trigger set

    if (checkTrigger(achievement.trigger_type, achievement.trigger_value, triggerType, triggerValue)) {
      toAward.push(achievement)
    }
  }

  // Award achievements
  const awarded: Achievement[] = []
  for (const achievement of toAward) {
    const { success } = await awardAchievement(supabase, userId, achievement.id)
    if (success) {
      awarded.push(achievement)
    }
  }

  return awarded
}

/**
 * Check if a trigger matches
 */
function checkTrigger(
  achievementTriggerType: string,
  achievementTriggerValue: string | null,
  currentTriggerType: string,
  currentTriggerValue: string | number
): boolean {
  if (achievementTriggerType !== currentTriggerType) return false

  if (!achievementTriggerValue) return true // No value constraint

  switch (achievementTriggerType) {
    case 'module_complete':
      // e.g., "5" means 5 modules completed
      return parseInt(achievementTriggerValue) <= parseInt(String(currentTriggerValue))

    case 'login_count':
      // e.g., "1" means first login
      return parseInt(achievementTriggerValue) <= parseInt(String(currentTriggerValue))

    case 'streak_days':
      // e.g., "7" means 7 day streak
      return parseInt(achievementTriggerValue) <= parseInt(String(currentTriggerValue))

    case 'channels_configured':
      // e.g., "3" means all 3 channels configured
      return parseInt(achievementTriggerValue) <= parseInt(String(currentTriggerValue))

    case 'gateway_configured':
      // e.g., "1" means gateway is configured
      return currentTriggerValue === 1 || currentTriggerValue === '1'

    case 'clawbot_messages':
      // e.g., "10" means 10+ messages sent
      return parseInt(achievementTriggerValue) <= parseInt(String(currentTriggerValue))

    case 'signup_before':
      // e.g., "2026-06-01" means signed up before this date
      const signupDate = new Date(String(currentTriggerValue))
      const deadlineDate = new Date(achievementTriggerValue)
      return signupDate <= deadlineDate

    default:
      return false
  }
}

/**
 * Get all achievements with user's earned status
 */
export async function getAchievementsWithStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<{ achievements: Achievement[]; earned: UserAchievement[]; earnedIds: Set<string> }> {
  const [allRes, earnedRes] = await Promise.all([
    supabase.from('achievements').select('*').order('xp_reward', { ascending: true }),
    supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })
  ])

  const earned = earnedRes.data || []
  const earnedIds = new Set(earned.map(e => e.achievement_id))

  return {
    achievements: allRes.data || [],
    earned,
    earnedIds
  }
}

/**
 * Get user's unnotified achievements
 */
export async function getUnnotifiedAchievements(
  supabase: SupabaseClient,
  userId: string
): Promise<Achievement[]> {
  const { data: unnotified } = await supabase
    .from('user_achievements')
    .select('*, achievement:achievements(*)')
    .eq('user_id', userId)
    .eq('notified', false)

  return (unnotified || []).map(ua => ua.achievement).filter(Boolean)
}
