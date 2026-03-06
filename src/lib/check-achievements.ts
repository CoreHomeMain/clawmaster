import { dispatchAchievementsNotifications } from './achievement-notifier'

/**
 * Check for unnotified achievements and display notifications
 */
export async function checkAndShowAchievements() {
  try {
    const res = await fetch('/api/achievements/user')
    if (!res.ok) return

    const data = await res.json()
    const unnotified = data.unnotified || []

    if (unnotified.length === 0) return

    // Convert to notification format
    const notifications = unnotified.map((achievement: any) => ({
      id: achievement.id,
      icon: achievement.icon,
      title: achievement.title,
      description: achievement.description,
      xpReward: achievement.xp_reward
    }))

    dispatchAchievementsNotifications(notifications)

    // Mark as notified
    await fetch('/api/achievements/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        achievementIds: unnotified.map((a: any) => a.id)
      })
    })
  } catch (e) {
    console.error('Failed to check achievements:', e)
  }
}
