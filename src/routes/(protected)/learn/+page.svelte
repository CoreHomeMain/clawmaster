<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData

  $: modules = data.modules || []
  $: progress = data.progress || []
  $: paths = data.paths || []

  function getProgressForModule(moduleId: string) {
    return progress.find((p: any) => p.module_id === moduleId)
  }

  function getLevelColor(level: string) {
    if (level === 'beginner') return 'text-green-400 bg-green-400/10 border-green-400/30'
    if (level === 'intermediate') return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    return 'text-purple-400 bg-purple-400/10 border-purple-400/30'
  }

  const levelOrder = ['beginner', 'intermediate', 'advanced']
  $: grouped = levelOrder.reduce((acc: any, level) => {
    acc[level] = modules.filter((m: any) => m.level === level)
    return acc
  }, {})
</script>

<svelte:head>
  <title>Learn — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117]">
  <!-- Nav -->
  <nav class="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2">
      <span class="text-xl">🦞</span>
      <span class="font-bold text-white">Claw<span class="text-orange-500">Master</span></span>
    </a>
    <div class="flex gap-4 text-sm">
      <a href="/dashboard" class="text-slate-400 hover:text-white transition">Dashboard</a>
      <a href="/learn" class="text-orange-400 font-medium">Learn</a>
      <a href="/chat" class="text-slate-400 hover:text-white transition">ClawBot</a>
      <a href="/config" class="text-slate-400 hover:text-white transition">Config</a>
    </div>
  </nav>

  <div class="max-w-6xl mx-auto px-4 py-12">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-white mb-2">Module Library</h1>
      <p class="text-slate-400">15 modules from beginner to advanced. Start where you are, go where you want.</p>
    </div>

    {#each levelOrder as level}
      {#if grouped[level]?.length > 0}
        <div class="mb-12">
          <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="px-3 py-1 text-sm border rounded-full capitalize {getLevelColor(level)}">{level}</span>
            <span class="text-slate-500 text-sm font-normal">{grouped[level].length} modules</span>
          </h2>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each grouped[level] as module}
              {@const prog = getProgressForModule(module.id)}
              <a
                href="/learn/{module.slug}"
                class="bg-[#161b22] border border-slate-700 hover:border-orange-500/50 rounded-2xl p-6 transition group block"
              >
                <!-- Progress bar -->
                {#if prog && prog.progress_pct > 0}
                  <div class="h-1 bg-slate-800 rounded-full mb-4 overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      style="width: {prog.progress_pct}%"
                    ></div>
                  </div>
                {/if}

                <div class="flex items-start justify-between mb-3">
                  <span class="px-2 py-0.5 text-xs border rounded-full capitalize {getLevelColor(module.level)}">{module.level}</span>
                  {#if prog?.status === 'completed'}
                    <span class="text-green-400 text-xs">✓ Complete</span>
                  {:else if prog?.status === 'in_progress'}
                    <span class="text-orange-400 text-xs">In Progress</span>
                  {/if}
                </div>

                <h3 class="text-white font-bold mb-2 group-hover:text-orange-400 transition">{module.title}</h3>
                <p class="text-slate-400 text-sm leading-relaxed mb-4">{module.description || ''}</p>

                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>⏱️ {module.estimated_minutes} min</span>
                  <span>⚡ {module.xp_reward} XP</span>
                </div>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    {/each}

    {#if modules.length === 0}
      <div class="text-center py-24">
        <div class="text-5xl mb-4">📚</div>
        <h2 class="text-xl font-bold text-white mb-2">Modules Coming Soon</h2>
        <p class="text-slate-400">Content is being prepared. Check back shortly!</p>
      </div>
    {/if}
  </div>
</div>
