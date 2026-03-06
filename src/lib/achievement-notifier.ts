/**
 * Utility to show achievement notifications on the page
 * Usage: dispatchAchievementNotification({ ... })
 */

export interface AchievementNotification {
  id: string
  icon: string
  title: string
  description: string
  xpReward: number
}

export function dispatchAchievementNotification(achievement: AchievementNotification) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('achievement:unlocked', {
      detail: achievement
    })
    window.dispatchEvent(event)
  }
}

/**
 * Show multiple achievements
 */
export function dispatchAchievementsNotifications(achievements: AchievementNotification[]) {
  achievements.forEach(achievement => {
    // Stagger notifications
    setTimeout(
      () => dispatchAchievementNotification(achievement),
      achievements.indexOf(achievement) * 500
    )
  })
}
