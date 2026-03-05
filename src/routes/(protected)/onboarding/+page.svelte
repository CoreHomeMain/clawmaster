<script lang="ts">
  import { goto } from '$app/navigation'
  import type { PageData } from './$types'
  export let data: PageData

  const questions = [
    {
      id: 'skill_level',
      question: 'What is your current experience with OpenClaw?',
      options: [
        { value: 'beginner', label: '🌱 Complete beginner — never used it', points: 0 },
        { value: 'some', label: '🌿 Tried it briefly, still learning basics', points: 1 },
        { value: 'intermediate', label: '🌳 Using it daily, want to go deeper', points: 2 },
        { value: 'advanced', label: '🏔️ Power user, want advanced techniques', points: 3 },
      ]
    },
    {
      id: 'goal',
      question: 'What is your main goal with OpenClaw?',
      options: [
        { value: 'personal_ai', label: '🤖 Personal AI assistant on my devices', points: 0 },
        { value: 'automate', label: '⚡ Automate workflows and tasks', points: 1 },
        { value: 'multi_channel', label: '📱 Connect multiple chat apps', points: 1 },
        { value: 'build', label: '🛠️ Build custom AI agents and skills', points: 2 },
      ]
    },
    {
      id: 'os',
      question: 'What operating system are you using?',
      options: [
        { value: 'mac', label: '🍎 macOS', points: 0 },
        { value: 'windows', label: '🪟 Windows', points: 0 },
        { value: 'linux', label: '🐧 Linux', points: 0 },
        { value: 'raspberry_pi', label: '🥧 Raspberry Pi / ARM', points: 0 },
      ]
    },
    {
      id: 'preferred_channel',
      question: 'Which chat channel do you want to connect first?',
      options: [
        { value: 'telegram', label: '✈️ Telegram', points: 0 },
        { value: 'discord', label: '💬 Discord', points: 0 },
        { value: 'whatsapp', label: '📱 WhatsApp', points: 0 },
        { value: 'not_sure', label: '🤷 Not sure yet', points: 0 },
      ]
    },
    {
      id: 'time_per_week',
      question: 'How much time can you dedicate to learning per week?',
      options: [
        { value: '30min', label: '⏱️ 30 minutes', points: 0 },
        { value: '1-2h', label: '⏰ 1-2 hours', points: 0 },
        { value: '3-5h', label: '🕐 3-5 hours', points: 0 },
        { value: '5h+', label: '🚀 5+ hours — let\'s go!', points: 0 },
      ]
    }
  ]

  let currentQuestion = 0
  let answers: Record<string, string> = {}
  let submitting = false
  let error = ''

  function selectAnswer(questionId: string, value: string) {
    answers[questionId] = value
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      currentQuestion++
    }
  }

  function prevQuestion() {
    if (currentQuestion > 0) {
      currentQuestion--
    }
  }

  function calculateLevel(): string {
    const skillPoints = questions[0].options.find(o => o.value === answers.skill_level)?.points || 0
    const goalPoints = questions[1].options.find(o => o.value === answers.goal)?.points || 0
    const total = skillPoints + goalPoints

    if (total >= 4) return 'advanced'
    if (total >= 2) return 'intermediate'
    return 'beginner'
  }

  function getRecommendedPath(level: string): { title: string; description: string; modules: string[] } {
    if (level === 'advanced') {
      return {
        title: 'Power User Track',
        description: 'Jump straight to advanced patterns, custom skills, and multi-agent orchestration.',
        modules: ['Configuring Your Agent Persona', 'Memory System Mastery', 'Multi-Agent Routing', 'Introduction to Skills', 'Building Your First Skill']
      }
    }
    if (level === 'intermediate') {
      return {
        title: 'Intermediate Track',
        description: 'Build on your foundation with advanced configuration and multi-channel setup.',
        modules: ['Configuring Your Agent Persona', 'Memory System Mastery', 'Connecting Discord', 'Connecting WhatsApp', 'Multi-Agent Routing']
      }
    }
    return {
      title: 'Beginner Track',
      description: 'Start from scratch with clear, step-by-step guidance to get OpenClaw running.',
      modules: ['What is OpenClaw?', 'Self-Hosted AI: Why It Matters', 'Installing OpenClaw', 'Your First Gateway', 'The Control UI']
    }
  }

  let showResult = false
  let recommendedLevel = ''
  let recommendedPath: ReturnType<typeof getRecommendedPath> | null = null

  async function submitQuiz() {
    submitting = true
    error = ''

    recommendedLevel = calculateLevel()
    recommendedPath = getRecommendedPath(recommendedLevel)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          level: recommendedLevel
        })
      })

      if (res.ok) {
        showResult = true
      } else {
        // Still show result even if save fails
        showResult = true
      }
    } catch (e) {
      showResult = true
    }

    submitting = false
  }

  $: currentQ = questions[currentQuestion]
  $: currentAnswer = answers[currentQ?.id]
  $: progress = ((currentQuestion + 1) / questions.length) * 100
  $: allAnswered = Object.keys(answers).length === questions.length
</script>

<svelte:head>
  <title>Onboarding Quiz — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-2xl">

    {#if !showResult}
      <!-- Quiz Header -->
      <div class="text-center mb-8">
        <a href="/" class="inline-flex items-center gap-2 mb-4">
          <span class="text-2xl">🦞</span>
          <span class="text-xl font-bold text-white">Claw<span class="text-orange-500">Master</span></span>
        </a>
        <h1 class="text-2xl font-bold text-white">Let's personalize your learning path</h1>
        <p class="text-slate-400 mt-2">5 quick questions · Takes 60 seconds</p>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8">
        <div class="flex justify-between text-xs text-slate-500 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
            style="width: {progress}%"
          ></div>
        </div>
      </div>

      <!-- Question Card -->
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8 mb-6">
        <h2 class="text-white text-xl font-semibold mb-6">{currentQ.question}</h2>

        <div class="space-y-3">
          {#each currentQ.options as option}
            <button
              class="w-full text-left px-5 py-4 rounded-xl border transition font-medium {currentAnswer === option.value
                ? 'border-orange-500 bg-orange-500/10 text-white'
                : 'border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white'}"
              on:click={() => selectAnswer(currentQ.id, option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>

      {#if error}
        <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      {/if}

      <!-- Navigation -->
      <div class="flex gap-4">
        {#if currentQuestion > 0}
          <button
            on:click={prevQuestion}
            class="flex-1 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition"
          >
            ← Back
          </button>
        {/if}

        {#if currentQuestion < questions.length - 1}
          <button
            on:click={nextQuestion}
            disabled={!currentAnswer}
            class="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition"
          >
            Next →
          </button>
        {:else}
          <button
            on:click={submitQuiz}
            disabled={!allAnswered || submitting}
            class="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-xl transition"
          >
            {submitting ? 'Saving...' : 'See My Learning Path →'}
          </button>
        {/if}
      </div>

    {:else}
      <!-- Result Screen -->
      <div class="text-center mb-8">
        <div class="text-5xl mb-4">🎯</div>
        <h1 class="text-3xl font-bold text-white mb-2">Your Learning Path is Ready!</h1>
        <p class="text-slate-400">Based on your answers, we've selected the perfect track for you.</p>
      </div>

      <div class="bg-[#161b22] border border-orange-500/30 rounded-2xl p-8 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="px-3 py-1 bg-orange-500/20 border border-orange-500/50 text-orange-400 text-sm font-semibold rounded-full capitalize">
            {recommendedLevel} Level
          </div>
          <h2 class="text-white font-bold text-xl">{recommendedPath?.title}</h2>
        </div>

        <p class="text-slate-400 mb-6">{recommendedPath?.description}</p>

        <h3 class="text-slate-300 text-sm font-medium mb-3">Your first 5 modules:</h3>
        <div class="space-y-2">
          {#each recommendedPath?.modules || [] as module, i}
            <div class="flex items-center gap-3 text-slate-300 text-sm">
              <div class="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
                {i + 1}
              </div>
              {module}
            </div>
          {/each}
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <a
          href="/learn"
          class="block text-center py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl transition"
        >
          Start Learning Now →
        </a>
        <a
          href="/dashboard"
          class="block text-center py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition"
        >
          Go to Dashboard
        </a>
      </div>
    {/if}
  </div>
</div>
