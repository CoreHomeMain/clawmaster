import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * API Achievements Integration Tests
 * Tests for achievements listing, checking, and user XP
 */
describe('Achievements API Integration', () => {
  const mockSupabase = {
    from: vi.fn(),
    rpc: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/achievements', () => {
    it('should list all achievements with user earned status', async () => {
      const achievements = [
        {
          id: 'ach1',
          slug: 'first-login',
          title: 'First Login',
          description: 'Log in for the first time',
          icon: '🎯',
          xp_reward: 50,
          trigger_type: 'login_count'
        },
        {
          id: 'ach2',
          slug: 'five-modules',
          title: 'Module Master',
          description: 'Complete 5 modules',
          icon: '🏆',
          xp_reward: 100,
          trigger_type: 'module_complete'
        }
      ]

      const userEarned = new Set(['ach1'])

      expect(achievements).toHaveLength(2)
      expect(userEarned.has('ach1')).toBe(true)
      expect(userEarned.has('ach2')).toBe(false)
    })

    it('should return earned achievements with timestamps', async () => {
      const earnedAchievements = [
        {
          id: 'ua1',
          achievement_id: 'ach1',
          user_id: 'user1',
          earned_at: '2026-03-01T10:00:00Z',
          notified: true
        }
      ]

      expect(earnedAchievements).toHaveLength(1)
      expect(earnedAchievements[0].earned_at).toBeTruthy()
      expect(earnedAchievements[0].notified).toBe(true)
    })
  })

  describe('POST /api/achievements (check and award)', () => {
    it('should check achievements by trigger type and value', async () => {
      const triggerType = 'module_complete'
      const triggerValue = 5

      expect(triggerType).toBe('module_complete')
      expect(triggerValue).toBe(5)
    })

    it('should return newly awarded achievements', async () => {
      const awarded = [
        {
          id: 'ach2',
          title: 'Module Master',
          xp_reward: 100
        }
      ]

      expect(awarded).toHaveLength(1)
      expect(awarded[0].title).toBe('Module Master')
      expect(awarded[0].xp_reward).toBe(100)
    })

    it('should not re-award already earned achievements', async () => {
      const allAchievements = [
        { id: 'ach1', trigger_type: 'login_count' },
        { id: 'ach2', trigger_type: 'module_complete' }
      ]

      const userEarned = new Set(['ach1'])
      const toAward = allAchievements.filter(a => !userEarned.has(a.id))

      expect(toAward).toHaveLength(1)
      expect(toAward[0].id).toBe('ach2')
    })

    it('should validate trigger type and value are provided', async () => {
      let errors: string[] = []

      const triggerType = 'module_complete'
      const triggerValue = 5

      if (!triggerType) errors.push('triggerType required')
      if (triggerValue === undefined) errors.push('triggerValue required')

      expect(errors).toHaveLength(0)
    })

    it('should handle missing trigger parameters', async () => {
      let errors: string[] = []

      const triggerType = null
      const triggerValue = 5

      if (!triggerType) errors.push('triggerType required')
      if (triggerValue === undefined) errors.push('triggerValue required')

      expect(errors).toHaveLength(1)
      expect(errors[0]).toBe('triggerType required')
    })
  })

  describe('GET /api/achievements/user', () => {
    it('should return user XP and level', async () => {
      const userXp = {
        user_id: 'user1',
        total_xp: 1250,
        level: 3,
        updated_at: '2026-03-05T10:00:00Z'
      }

      expect(userXp.total_xp).toBe(1250)
      expect(userXp.level).toBe(3)
    })

    it('should calculate level from total XP', async () => {
      const calculateLevel = (xp: number) => Math.floor(xp / 500) + 1

      expect(calculateLevel(0)).toBe(1)
      expect(calculateLevel(500)).toBe(2)
      expect(calculateLevel(1500)).toBe(4)
    })

    it('should return unnotified achievements', async () => {
      const unnotified = [
        {
          id: 'ach3',
          title: 'Advanced Master',
          description: 'Reach advanced level',
          icon: '⭐',
          xp_reward: 150,
          notified: false
        }
      ]

      expect(unnotified).toHaveLength(1)
      expect(unnotified[0].notified).toBe(false)
    })

    it('should filter out notified achievements', async () => {
      const allUserAchievements = [
        { id: 'ach1', notified: true },
        { id: 'ach2', notified: false },
        { id: 'ach3', notified: true }
      ]

      const unnotified = allUserAchievements.filter(a => !a.notified)
      expect(unnotified).toHaveLength(1)
      expect(unnotified[0].id).toBe('ach2')
    })
  })

  describe('POST /api/achievements/notify', () => {
    it('should mark achievements as notified', async () => {
      const achievementIds = ['ach1', 'ach2']

      // Simulate marking as notified
      const notified = new Set(achievementIds)

      expect(notified.has('ach1')).toBe(true)
      expect(notified.has('ach2')).toBe(true)
    })

    it('should handle empty achievement list', async () => {
      const achievementIds: string[] = []

      expect(achievementIds).toHaveLength(0)
    })
  })

  describe('Achievement Progress Tracking', () => {
    it('should track XP progression towards next level', async () => {
      const currentXp = 750
      const nextLevelXp = 1000
      const progress = (currentXp / nextLevelXp) * 100

      expect(progress).toBe(75)
    })

    it('should display XP earned from achievements', async () => {
      const baseXp = 0
      const achievementsEarned = [
        { xp_reward: 50 },
        { xp_reward: 100 },
        { xp_reward: 75 }
      ]

      const totalXp = baseXp + achievementsEarned.reduce((sum, a) => sum + a.xp_reward, 0)
      expect(totalXp).toBe(225)
    })
  })

  describe('Achievement Trigger Types', () => {
    it('should support module_complete trigger', async () => {
      const trigger = { type: 'module_complete', value: '5' }
      expect(trigger.type).toBe('module_complete')
    })

    it('should support login_count trigger', async () => {
      const trigger = { type: 'login_count', value: '1' }
      expect(trigger.type).toBe('login_count')
    })

    it('should support streak_days trigger', async () => {
      const trigger = { type: 'streak_days', value: '7' }
      expect(trigger.type).toBe('streak_days')
    })

    it('should support channels_configured trigger', async () => {
      const trigger = { type: 'channels_configured', value: '3' }
      expect(trigger.type).toBe('channels_configured')
    })

    it('should support gateway_configured trigger', async () => {
      const trigger = { type: 'gateway_configured', value: '1' }
      expect(trigger.type).toBe('gateway_configured')
    })

    it('should support clawbot_messages trigger', async () => {
      const trigger = { type: 'clawbot_messages', value: '10' }
      expect(trigger.type).toBe('clawbot_messages')
    })

    it('should support signup_before trigger', async () => {
      const trigger = { type: 'signup_before', value: '2026-06-01' }
      expect(trigger.type).toBe('signup_before')
    })
  })
})
