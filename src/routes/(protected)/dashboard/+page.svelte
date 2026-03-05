<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData

  $: profile = data.profile
  $: achievements = data.achievements || []
  $: progress = data.progress || []
  $: lastInProgress = data.lastInProgress

  function getLevelEmoji(level: string) {
    return level === 'beginner' ? '🌱' : level === 'intermediate' ? '🌳' : '🏔️'
  }

  function getLevelColor(level: string) {
    if (level === 'beginner') return 'text-green-400'
    if (level === 'intermediate') return 'text-blue-400'
    return 'text-purple-400'
  }
</script>

<svelte:head>
  <title>Dashboard — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117]">
  <!-- Nav -->
  <nav class="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2">
      <span class="text-xl">🦞</span>
      <span class="font-bold text-white">Claw<span class="text-orange-500">Master</span></span>
    </a>
    <div class="flex items-center gap-6 text-sm">
      <a href="/dashboard" class="text-orange-400 font-medium">Dashboard</a>
      <a href="/learn" class="text-slate-400 hover:text-white transition">Learn</a>
      <a href="/chat" class="text-slate-400 hover:text-white transition">ClawBot</a>
      <a href="/config" class="text-slate-400 hover:text-white transition">Config</a>
      <a href="/achievements" class="text-slate-400 hover:text-white transition">Achievements</a>
      <form method="POST" action="/logout">
        <button type="submit" class="text-slate-500 hover:text-slate-300 transition">Sign out</button>
      </form>
    </div>
  </nav>

  <div class="max-w-6xl mx-auto px-4 py-10">

    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-orange-900/20 to-[#161b22] border border-orange-500/20 rounded-2xl p-8 mb-8">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold text-white mb-1">
            Welcome back, {profile?.display_name || data.email?.split('@')[0] || 'Claw Master'}! 👋
          </h1>
          <div class="flex items-center gap-3 mt-2">
            <span class="{getLevelColor(profile?.level || 'beginner')} font-medium capitalize">
              {getLevelEmoji(profile?.level || 'beginner')} {profile?.level || 'beginner'} level
            </span>
            <span class="text-slate-600">·</span>
            <span class="text-slate-400">{profile?.xp || 0} XP</span>
          </div>

          <!-- XP Progress bar -->
          <div class="mt-4 max-w-md">
            <div class="flex justify-between text-xs text-slate-500 mb-1">
              <span>{profile?.xp || 0} XP</span>
              <span>{data.xpForNext} XP → {data.nextLevel}</span>
            </div>
            <div class="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                style="width: {data.xpProgress || 0}%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Credit balance -->
        <div class="text-right">
          <div class="text-sm text-slate-400 mb-1">ClawBot Credits</div>
          <div class="text-4xl font-extrabold text-orange-400">{profile?.credits || 0}</div>
          <a href="/checkout" class="text-xs text-slate-500 hover:text-orange-400 transition mt-1 inline-block">+ Get more</a>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">

      <!-- Left column: Continue Learning + Quick Links -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Continue Learning -->
        {#if lastInProgress?.module}
          <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6">
            <h2 class="text-white font-bold text-lg mb-4">📖 Continue Learning</h2>
            <a
              href="/learn/{lastInProgress.module.slug}"
              class="flex items-center gap-4 p-4 bg-[#0d1117] rounded-xl border border-slate-700 hover:border-orange-500/50 transition group"
            >
              <div class="flex-1">
                <p class="text-white font-semibold group-hover:text-orange-400 transition">{lastInProgress.module.title}</p>
                <p class="text-slate-400 text-sm mt-1 capitalize">{lastInProgress.module.level} · {lastInProgress.module.estimated_minutes} min</p>
                <div class="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-500 rounded-full"
                    style="width: {lastInProgress.progress_pct}%"
                  ></div>
                </div>
                <p class="text-xs text-slate-500 mt-1">{lastInProgress.progress_pct}% complete</p>
              </div>
              <div class="text-orange-400 text-2xl">→</div>
            </a>
          </div>
        {:else}
          <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6">
            <h2 class="text-white font-bold text-lg mb-4">🚀 Start Learning</h2>
            <p class="text-slate-400 mb-4">You haven't started any modules yet. Begin your OpenClaw journey!</p>
            <a
              href="/learn"
              class="inline-flex items-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition"
            >
              Browse Modules →
            </a>
          </div>
        {/if}

        <!-- Quick Links -->
        <div class="grid sm:grid-cols-3 gap-4">
          <a href="/learn" class="bg-[#161b22] border border-slate-700 hover:border-orange-500/50 rounded-xl p-5 transition group text-center">
            <div class="text-3xl mb-2">📚</div>
            <p class="text-white font-semibold group-hover:text-orange-400 transition text-sm">Module Library</p>
            <p class="text-slate-500 text-xs mt-1">15 modules</p>
          </a>
          <a href="/chat" class="bg-[#161b22] border border-slate-700 hover:border-orange-500/50 rounded-xl p-5 transition group text-center">
            <div class="text-3xl mb-2">🤖</div>
            <p class="text-white font-semibold group-hover:text-orange-400 transition text-sm">ClawBot AI</p>
            <p class="text-slate-500 text-xs mt-1">Ask anything</p>
          </a>
          <a href="/config" class="bg-[#161b22] border border-slate-700 hover:border-orange-500/50 rounded-xl p-5 transition group text-center">
            <div class="text-3xl mb-2">⚙️</div>
            <p class="text-white font-semibold group-hover:text-orange-400 transition text-sm">Config Wizards</p>
            <p class="text-slate-500 text-xs mt-1">Setup guides</p>
          </a>
        </div>

        <!-- Recent Progress -->
        {#if progress.length > 0}
          <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6">
            <h2 class="text-white font-bold text-lg mb-4">📊 Recent Progress</h2>
            <div class="space-y-3">
              {#each progress.slice(0, 4) as p}
                {#if p.module}
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full {p.status === 'completed' ? 'bg-green-500/20' : 'bg-orange-500/20'} flex items-center justify-center text-sm flex-shrink-0">
                      {p.status === 'completed' ? '✓' : '→'}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-white text-sm font-medium truncate">{p.module.title}</p>
                      <p class="text-slate-500 text-xs capitalize">{p.status.replace('_', ' ')}</p>
                    </div>
                    {#if p.status === 'completed'}
                      <span class="text-green-400 text-xs">Complete</span>
                    {:else}
                      <span class="text-slate-500 text-xs">{p.progress_pct}%</span>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Right column: Achievements -->
      <div class="space-y-6">
        <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-white font-bold text-lg">🏆 Achievements</h2>
            <a href="/achievements" class="text-orange-400 text-sm hover:text-orange-300 transition">View all</a>
          </div>

          {#if achievements.length > 0}
            <div class="space-y-3">
              {#each achievements as ua}
                {#if ua.achievement}
                  <div class="flex items-center gap-3 p-3 bg-[#0d1117] rounded-xl">
                    <div class="text-2xl">{ua.achievement.icon}</div>
                    <div>
                      <p class="text-white text-sm font-medium">{ua.achievement.title}</p>
                      <p class="text-slate-500 text-xs">{ua.achievement.description}</p>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          {:else}
            <div class="text-center py-6">
              <div class="text-3xl mb-2">🎯</div>
              <p class="text-slate-400 text-sm">Complete modules to earn achievements!</p>
              <a href="/learn" class="text-orange-400 text-sm hover:text-orange-300 transition mt-2 inline-block">Start learning →</a>
            </div>
          {/if}
        </div>

        <!-- Get Full Access (if no credits) -->
        {#if (profile?.credits || 0) < 50}
          <div class="bg-gradient-to-b from-orange-900/20 to-[#161b22] border border-orange-500/30 rounded-2xl p-6 text-center">
            <div class="text-3xl mb-2">⚡</div>
            <h3 class="text-white font-bold mb-2">Running low on credits?</h3>
            <p class="text-slate-400 text-sm mb-4">Get 1,000 ClawBot credits + full module access for just $19</p>
            <a href="/checkout" class="block py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition text-sm">
              Upgrade — $19 One-Time
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
