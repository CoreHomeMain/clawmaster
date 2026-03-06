import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateLevel,
  checkTrigger,
  awardAchievement,
  getAchievementsWithStatus,
  getUnnotifiedAchievements
} from '$lib/server/achievements'
import type { Achievement, UserAchievement } from '$lib/server/achievements'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(function () {
      return this
    }),
    eq: vi.fn(function () {
      return this
    }),
    in: vi.fn(function () {
      return this
    }),
    order: vi.fn(function () {
      return this
    }),
    single: vi.fn(async () => ({ data: null, error: null })),
    insert: vi.fn(async () => ({ data: null, error: null })),
    update: vi.fn(async () => ({ data: null, error: null }))
  }))
}

describe('Achievement System', () => {
  describe('calculateLevel', () => {
    it('should calculate level from XP (level = floor(xp/500) + 1)', () => {
      expect(calculateLevel(0)).toBe(1)
      expect(calculateLevel(250)).toBe(1)
      expect(calculateLevel(499)).toBe(1)
      expect(calculateLevel(500)).toBe(2)
      expect(calculateLevel(999)).toBe(2)
      expect(calculateLevel(1000)).toBe(3)
      expect(calculateLevel(2500)).toBe(6)
    })

    it('should handle edge cases', () => {
      expect(calculateLevel(1)).toBe(1)
      expect(calculateLevel(5000)).toBe(11)
    })
  })

  describe('checkTrigger', () => {
    it('should match module_complete trigger', () => {
      const result = checkTrigger('module_complete', '5', 'module_complete', 5)
      expect(result).toBe(true)

      const resultLower = checkTrigger('module_complete', '10', 'module_complete', 5)
      expect(resultLower).toBe(false)

      const resultEqual = checkTrigger('module_complete', '3', 'module_complete', 3)
      expect(resultEqual).toBe(true)
    })

    it('should match login_count trigger', () => {
      expect(checkTrigger('login_count', '1', 'login_count', 1)).toBe(true)
      expect(checkTrigger('login_count', '5', 'login_count', 10)).toBe(true)
      expect(checkTrigger('login_count', '10', 'login_count', 5)).toBe(false)
    })

    it('should match streak_days trigger', () => {
      expect(checkTrigger('streak_days', '7', 'streak_days', 7)).toBe(true)
      expect(checkTrigger('streak_days', '7', 'streak_days', 10)).toBe(true)
      expect(checkTrigger('streak_days', '7', 'streak_days', 3)).toBe(false)
    })

    it('should match channels_configured trigger', () => {
      expect(checkTrigger('channels_configured', '3', 'channels_configured', 3)).toBe(true)
      expect(checkTrigger('channels_configured', '3', 'channels_configured', 5)).toBe(true)
      expect(checkTrigger('channels_configured', '3', 'channels_configured', 2)).toBe(false)
    })

    it('should match gateway_configured trigger', () => {
      expect(checkTrigger('gateway_configured', '1', 'gateway_configured', 1)).toBe(true)
      expect(checkTrigger('gateway_configured', '1', 'gateway_configured', '1')).toBe(true)
      expect(checkTrigger('gateway_configured', '1', 'gateway_configured', 0)).toBe(false)
    })

    it('should match clawbot_messages trigger', () => {
      expect(checkTrigger('clawbot_messages', '10', 'clawbot_messages', 10)).toBe(true)
      expect(checkTrigger('clawbot_messages', '10', 'clawbot_messages', 15)).toBe(true)
      expect(checkTrigger('clawbot_messages', '10', 'clawbot_messages', 5)).toBe(false)
    })

    it('should match signup_before trigger', () => {
      const earlyDate = '2026-01-01'
      const lateDate = '2026-06-01'
      const deadline = '2026-04-01'

      expect(checkTrigger('signup_before', deadline, 'signup_before', earlyDate)).toBe(true)
      expect(checkTrigger('signup_before', deadline, 'signup_before', lateDate)).toBe(false)
      expect(checkTrigger('signup_before', deadline, 'signup_before', deadline)).toBe(true)
    })

    it('should return true when achievement has no trigger value', () => {
      expect(checkTrigger('module_complete', null, 'module_complete', 1)).toBe(true)
      expect(checkTrigger('login_count', '', 'login_count', 5)).toBe(true)
    })

    it('should return false for mismatched trigger types', () => {
      expect(checkTrigger('module_complete', '5', 'login_count', 5)).toBe(false)
      expect(checkTrigger('streak_days', '7', 'channels_configured', 7)).toBe(false)
    })

    it('should return false for unknown trigger types', () => {
      expect(checkTrigger('unknown_trigger', '1', 'unknown_trigger', 1)).toBe(false)
    })
  })

  describe('awardAchievement', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should award achievement and return success', async () => {
      const mockSupa = {
        from: vi.fn((table: string) => {
          if (table === 'user_achievements') {
            return {
              insert: vi.fn(async () => ({ data: null, error: null }))
            }
          }
          if (table === 'achievements') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(async () => ({
                  data: { id: 'ach1', xp_reward: 100 },
                  error: null
                })),
                single: vi.fn()
              })),
              single: vi.fn()
            }
          }
          if (table === 'user_profiles') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(async () => ({
                  data: { xp: 50 },
                  error: null
                })),
                single: vi.fn()
              })),
              update: vi.fn(() => ({
                eq: vi.fn(async () => ({ error: null }))
              }))
            }
          }
          return {}
        })
      } as any

      const result = await awardAchievement(mockSupa, 'user1', 'ach1')
      expect(result.success).toBe(true)
      expect(result.xpAwarded).toBe(100)
    })

    it('should handle insertion errors', async () => {
      const mockSupa = {
        from: vi.fn(() => ({
          insert: vi.fn(async () => ({ error: new Error('Insert failed') }))
        }))
      } as any

      const result = await awardAchievement(mockSupa, 'user1', 'ach1')
      expect(result.success).toBe(false)
    })
  })

  describe('getAchievementsWithStatus', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return achievements with earned status', async () => {
      const mockSupa = {
        from: vi.fn((table: string) => {
          if (table === 'achievements') {
            return {
              select: vi.fn(() => ({
                order: vi.fn(async () => ({
                  data: [
                    { id: 'ach1', title: 'First Login', xp_reward: 50 },
                    { id: 'ach2', title: 'First Module', xp_reward: 100 }
                  ],
                  error: null
                }))
              }))
            }
          }
          if (table === 'user_achievements') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(async () => ({
                    data: [{ id: 'ua1', achievement_id: 'ach1', earned_at: '2026-03-01' }],
                    error: null
                  }))
                }))
              }))
            }
          }
          return {}
        })
      } as any

      const result = await getAchievementsWithStatus(mockSupa, 'user1')
      expect(result.achievements.length).toBe(2)
      expect(result.earned.length).toBe(1)
      expect(result.earnedIds.has('ach1')).toBe(true)
      expect(result.earnedIds.has('ach2')).toBe(false)
    })
  })

  describe('getUnnotifiedAchievements', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return unnotified achievements for user', async () => {
      const mockSupa = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(async () => ({
                data: [
                  {
                    id: 'ua1',
                    achievement: {
                      id: 'ach1',
                      title: 'First Login',
                      icon: '🎯',
                      description: 'Login for the first time',
                      xp_reward: 50
                    }
                  }
                ],
                error: null
              }))
            }))
          }))
        }))
      } as any

      const result = await getUnnotifiedAchievements(mockSupa, 'user1')
      expect(result.length).toBe(1)
      expect(result[0].title).toBe('First Login')
    })
  })
})
