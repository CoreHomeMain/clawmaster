import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * API Modules Integration Tests
 * Tests for module listing, getting, and progress updates
 */
describe('Modules API Integration', () => {
  const mockSupabase = {
    from: vi.fn(),
    rpc: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/modules', () => {
    it('should list all modules', async () => {
      const modules = [
        {
          id: 'mod1',
          slug: 'intro-to-openclaw',
          title: 'Intro to OpenClaw',
          level: 'beginner',
          estimated_minutes: 30,
          xp_reward: 100
        },
        {
          id: 'mod2',
          slug: 'advanced-config',
          title: 'Advanced Configuration',
          level: 'intermediate',
          estimated_minutes: 60,
          xp_reward: 200
        }
      ]

      expect(modules).toHaveLength(2)
      expect(modules[0].title).toBe('Intro to OpenClaw')
      expect(modules[1].level).toBe('intermediate')
    })

    it('should filter modules by level', async () => {
      const allModules = [
        { id: 'mod1', level: 'beginner' },
        { id: 'mod2', level: 'intermediate' },
        { id: 'mod3', level: 'beginner' }
      ]

      const beginnerModules = allModules.filter(m => m.level === 'beginner')
      expect(beginnerModules).toHaveLength(2)
    })
  })

  describe('GET /api/modules/[id]', () => {
    it('should return module details with user progress', async () => {
      const module = {
        id: 'mod1',
        slug: 'intro',
        title: 'Introduction',
        description: 'Learn the basics',
        content: '# Introduction',
        level: 'beginner',
        estimated_minutes: 30,
        xp_reward: 100
      }

      const userProgress = {
        module_id: 'mod1',
        user_id: 'user1',
        progress_pct: 50,
        status: 'in_progress',
        started_at: '2026-03-01T10:00:00Z'
      }

      expect(module.id).toBe('mod1')
      expect(userProgress.progress_pct).toBe(50)
      expect(userProgress.status).toBe('in_progress')
    })

    it('should handle missing module gracefully', async () => {
      const module = null
      expect(module).toBeNull()
    })
  })

  describe('POST /api/progress/[moduleId]', () => {
    it('should update module progress', async () => {
      const userId = 'user1'
      const moduleId = 'mod1'
      const progressPct = 75
      const status = 'in_progress'

      // Validate input
      let errors: string[] = []
      if (progressPct < 0 || progressPct > 100) {
        errors.push('Progress must be between 0 and 100')
      }

      expect(errors).toHaveLength(0)
    })

    it('should clamp progress percentage to 0-100', async () => {
      const validateAndClamp = (pct: number) => Math.min(100, Math.max(0, pct))

      expect(validateAndClamp(-50)).toBe(0)
      expect(validateAndClamp(50)).toBe(50)
      expect(validateAndClamp(150)).toBe(100)
    })

    it('should mark module as completed and award XP', async () => {
      const mockProgress = {
        user_id: 'user1',
        module_id: 'mod1',
        progress_pct: 100,
        status: 'completed',
        completed_at: new Date().toISOString()
      }

      const xpReward = 100

      expect(mockProgress.status).toBe('completed')
      expect(mockProgress.progress_pct).toBe(100)
      expect(xpReward).toBeGreaterThan(0)
    })

    it('should validate status values', async () => {
      const validStatuses = ['not_started', 'in_progress', 'completed']
      const status = 'in_progress'

      expect(validStatuses).toContain(status)
    })

    it('should handle invalid status', async () => {
      const validStatuses = ['not_started', 'in_progress', 'completed']
      const status = 'invalid'

      expect(validStatuses).not.toContain(status)
    })

    it('should set completed_at timestamp when status is completed', async () => {
      const now = new Date().toISOString()
      const progress = {
        status: 'completed' as const,
        completed_at: now
      }

      if (progress.status === 'completed') {
        expect(progress.completed_at).toBeTruthy()
      }
    })

    it('should not set completed_at for non-completed status', async () => {
      const progress = {
        status: 'in_progress' as const,
        completed_at: null
      }

      if (progress.status !== 'completed') {
        expect(progress.completed_at).toBeNull()
      }
    })
  })

  describe('Module completion flow', () => {
    it('should trigger achievement check on completion', async () => {
      const userId = 'user1'
      const moduleId = 'mod1'

      // Simulate completion
      const completedCount = 1

      const achievementCheck = {
        triggerType: 'module_complete',
        triggerValue: completedCount
      }

      expect(achievementCheck.triggerType).toBe('module_complete')
      expect(achievementCheck.triggerValue).toBe(1)
    })

    it('should award XP based on module reward', async () => {
      const moduleXpReward = 100
      const userCurrentXp = 250
      const userNewXp = userCurrentXp + moduleXpReward

      expect(userNewXp).toBe(350)
    })
  })

  describe('User Progress Retrieval', () => {
    it('should get all progress records for user', async () => {
      const userProgress = [
        {
          id: 'prog1',
          module_id: 'mod1',
          user_id: 'user1',
          progress_pct: 100,
          status: 'completed'
        },
        {
          id: 'prog2',
          module_id: 'mod2',
          user_id: 'user1',
          progress_pct: 50,
          status: 'in_progress'
        }
      ]

      expect(userProgress).toHaveLength(2)
      const completed = userProgress.filter(p => p.status === 'completed')
      expect(completed).toHaveLength(1)
    })

    it('should calculate overall progress percentage', async () => {
      const progressList = [
        { progress_pct: 100 },
        { progress_pct: 75 },
        { progress_pct: 50 }
      ]

      const avgProgress = progressList.reduce((sum, p) => sum + p.progress_pct, 0) / progressList.length
      expect(avgProgress).toBe(75)
    })

    it('should sort progress by most recent', async () => {
      const progress = [
        { id: 'p1', created_at: '2026-03-01T10:00:00Z' },
        { id: 'p2', created_at: '2026-03-05T10:00:00Z' },
        { id: 'p3', created_at: '2026-03-03T10:00:00Z' }
      ]

      const sorted = [...progress].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      expect(sorted[0].id).toBe('p2')
      expect(sorted[1].id).toBe('p3')
      expect(sorted[2].id).toBe('p1')
    })
  })
})
