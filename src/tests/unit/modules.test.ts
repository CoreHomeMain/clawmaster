import { describe, it, expect } from 'vitest'

/**
 * Module and Progress Tests
 */
describe('Module Progress System', () => {
  describe('Progress percentage validation', () => {
    const validateProgress = (progress: number): number => {
      return Math.min(100, Math.max(0, progress))
    }

    it('should clamp progress between 0 and 100', () => {
      expect(validateProgress(-10)).toBe(0)
      expect(validateProgress(0)).toBe(0)
      expect(validateProgress(50)).toBe(50)
      expect(validateProgress(100)).toBe(100)
      expect(validateProgress(150)).toBe(100)
    })
  })

  describe('Status validation', () => {
    const validStatuses = ['not_started', 'in_progress', 'completed']

    const validateStatus = (status: string): boolean => {
      return validStatuses.includes(status)
    }

    it('should validate status values', () => {
      expect(validateStatus('not_started')).toBe(true)
      expect(validateStatus('in_progress')).toBe(true)
      expect(validateStatus('completed')).toBe(true)
    })

    it('should reject invalid status values', () => {
      expect(validateStatus('invalid')).toBe(false)
      expect(validateStatus('pending')).toBe(false)
      expect(validateStatus('')).toBe(false)
    })
  })

  describe('XP calculation', () => {
    const calculateXpReward = (baseXp: number, completionPct: number): number => {
      // Award full XP only if 100% complete, otherwise scale proportionally
      return Math.floor(baseXp * (completionPct / 100))
    }

    it('should calculate XP based on completion percentage', () => {
      expect(calculateXpReward(100, 100)).toBe(100)
      expect(calculateXpReward(100, 50)).toBe(50)
      expect(calculateXpReward(100, 0)).toBe(0)
      expect(calculateXpReward(200, 75)).toBe(150)
    })

    it('should handle decimal percentages', () => {
      expect(calculateXpReward(100, 33.3)).toBe(33)
      expect(calculateXpReward(100, 66.6)).toBe(66)
    })
  })

  describe('Module level classification', () => {
    const classifyLevel = (level: string): string => {
      const levels = {
        'beginner': 'Beginner',
        'intermediate': 'Intermediate',
        'advanced': 'Advanced',
        'expert': 'Expert'
      } as Record<string, string>
      return levels[level] || 'Unknown'
    }

    it('should classify module levels', () => {
      expect(classifyLevel('beginner')).toBe('Beginner')
      expect(classifyLevel('intermediate')).toBe('Intermediate')
      expect(classifyLevel('advanced')).toBe('Advanced')
      expect(classifyLevel('expert')).toBe('Expert')
    })

    it('should handle unknown levels', () => {
      expect(classifyLevel('unknown')).toBe('Unknown')
      expect(classifyLevel('')).toBe('Unknown')
    })
  })

  describe('Completion tracking', () => {
    const isCompleted = (status: string, progressPct: number): boolean => {
      return status === 'completed' && progressPct === 100
    }

    it('should mark as completed only when status is completed and progress is 100', () => {
      expect(isCompleted('completed', 100)).toBe(true)
      expect(isCompleted('completed', 99)).toBe(false)
      expect(isCompleted('in_progress', 100)).toBe(false)
      expect(isCompleted('not_started', 100)).toBe(false)
    })
  })

  describe('Module streak calculation', () => {
    interface ModuleProgress {
      moduleId: string
      completedAt: string
      status: string
    }

    const calculateStreak = (progressList: ModuleProgress[]): number => {
      if (progressList.length === 0) return 0

      // Sort by completed date descending (most recent first)
      const sorted = [...progressList]
        .filter(p => p.status === 'completed')
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < sorted.length; i++) {
        const completedDate = new Date(sorted[i].completedAt)
        completedDate.setHours(0, 0, 0, 0)

        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)

        if (completedDate.getTime() === expectedDate.getTime()) {
          streak++
        } else {
          break
        }
      }

      return streak
    }

    it('should calculate consecutive completion streak', () => {
      const today = new Date()
      const yesterday = new Date(today.getTime() - 86400000)
      const twoDaysAgo = new Date(today.getTime() - 172800000)

      const progressList: ModuleProgress[] = [
        {
          moduleId: 'mod1',
          completedAt: today.toISOString(),
          status: 'completed'
        },
        {
          moduleId: 'mod2',
          completedAt: yesterday.toISOString(),
          status: 'completed'
        },
        {
          moduleId: 'mod3',
          completedAt: twoDaysAgo.toISOString(),
          status: 'completed'
        }
      ]

      expect(calculateStreak(progressList)).toBe(3)
    })

    it('should break streak on gap', () => {
      const today = new Date()
      const threeDaysAgo = new Date(today.getTime() - 259200000)

      const progressList: ModuleProgress[] = [
        {
          moduleId: 'mod1',
          completedAt: today.toISOString(),
          status: 'completed'
        },
        {
          moduleId: 'mod2',
          completedAt: threeDaysAgo.toISOString(),
          status: 'completed'
        }
      ]

      expect(calculateStreak(progressList)).toBe(1)
    })
  })

  describe('Time estimate display', () => {
    const formatTimeEstimate = (minutes: number): string => {
      if (minutes < 60) return `${minutes}m`
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }

    it('should format time estimates', () => {
      expect(formatTimeEstimate(30)).toBe('30m')
      expect(formatTimeEstimate(60)).toBe('1h')
      expect(formatTimeEstimate(90)).toBe('1h 30m')
      expect(formatTimeEstimate(120)).toBe('2h')
      expect(formatTimeEstimate(150)).toBe('2h 30m')
    })
  })

  describe('Module prerequisites', () => {
    interface Module {
      id: string
      slug: string
      prerequisiteId?: string
    }

    const canAccessModule = (module: Module, completedModuleIds: Set<string>): boolean => {
      // Can always access if no prerequisite
      if (!module.prerequisiteId) return true

      // Can access if prerequisite is completed
      return completedModuleIds.has(module.prerequisiteId)
    }

    it('should allow access to modules without prerequisites', () => {
      const module: Module = { id: '1', slug: 'intro' }
      expect(canAccessModule(module, new Set())).toBe(true)
    })

    it('should allow access when prerequisite is completed', () => {
      const module: Module = { id: '2', slug: 'advanced', prerequisiteId: '1' }
      const completed = new Set(['1'])
      expect(canAccessModule(module, completed)).toBe(true)
    })

    it('should deny access when prerequisite is not completed', () => {
      const module: Module = { id: '2', slug: 'advanced', prerequisiteId: '1' }
      const completed = new Set()
      expect(canAccessModule(module, completed)).toBe(false)
    })
  })
})
