<script lang="ts">
  import { onMount } from 'svelte'
  import type { PageData } from './$types'
  export let data: PageData

  $: module = data.module
  $: userProgress = data.userProgress
  $: prevModule = data.prevModule
  $: nextModule = data.nextModule

  let progress = userProgress?.progress_pct || 0
  let completed = userProgress?.status === 'completed'
  let saving = false

  // Parse markdown-ish content into sections
  function parseContent(content: string): Array<{ type: 'heading' | 'paragraph' | 'code' | 'list', content: string, lang?: string }> {
    if (!content) return []
    const lines = content.split('\n')
    const blocks: Array<{ type: 'heading' | 'paragraph' | 'code' | 'list', content: string, lang?: string }> = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (line.startsWith('```')) {
        const lang = line.slice(3).trim()
        let code = ''
        i++
        while (i < lines.length && !lines[i].startsWith('```')) {
          code += lines[i] + '\n'
          i++
        }
        blocks.push({ type: 'code', content: code.trimEnd(), lang: lang || 'bash' })
      } else if (line.startsWith('## ')) {
        blocks.push({ type: 'heading', content: line.slice(3) })
      } else if (line.startsWith('# ')) {
        blocks.push({ type: 'heading', content: line.slice(2) })
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        let listItems = ''
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          listItems += lines[i].slice(2) + '\n'
          i++
        }
        blocks.push({ type: 'list', content: listItems.trimEnd() })
        continue
      } else if (line.trim()) {
        blocks.push({ type: 'paragraph', content: line })
      }
      i++
    }
    return blocks
  }

  $: contentBlocks = parseContent(module?.content_mdx || '')

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
  }

  let copiedIndex = -1
  function handleCopy(index: number, code: string) {
    copyCode(code)
    copiedIndex = index
    setTimeout(() => { copiedIndex = -1 }, 2000)
  }

  async function saveProgress(pct: number, status: string) {
    saving = true
    try {
      await fetch(`/api/progress/${module.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress_pct: pct, status })
      })
    } finally {
      saving = false
    }
  }

  async function markComplete() {
    completed = true
    progress = 100
    await saveProgress(100, 'completed')
  }

  onMount(() => {
    // Auto-mark as in_progress when module is opened
    if (!completed) {
      saveProgress(progress || 10, 'in_progress')
    }

    // Track scroll progress
    const handleScroll = () => {
      if (completed) return
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = Math.min(95, Math.round((scrolled / total) * 100))
      if (pct > progress) {
        progress = pct
        if (pct > 80) {
          saveProgress(pct, 'in_progress')
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })
</script>

<svelte:head>
  <title>{module?.title} — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117]">
  <!-- Sticky progress header -->
  <div class="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur border-b border-slate-800">
    <div class="h-1 bg-slate-800">
      <div
        class="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
        style="width: {progress}%"
      ></div>
    </div>
    <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="/learn" class="text-slate-400 hover:text-white text-sm transition flex items-center gap-1">
        ← Back to Library
      </a>
      <div class="flex items-center gap-4">
        <span class="text-slate-500 text-xs">{progress}% read</span>
        {#if completed}
          <span class="text-green-400 text-sm font-medium">✓ Completed +{module?.xp_reward} XP</span>
        {:else}
          <button
            on:click={markComplete}
            disabled={saving}
            class="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Mark Complete
          </button>
        {/if}
      </div>
    </div>
  </div>

  <div class="max-w-4xl mx-auto px-4 py-12">
    <!-- Module header -->
    <div class="mb-10">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-2 py-0.5 text-xs border rounded-full capitalize
          {module?.level === 'beginner' ? 'text-green-400 bg-green-400/10 border-green-400/30' :
           module?.level === 'intermediate' ? 'text-blue-400 bg-blue-400/10 border-blue-400/30' :
           'text-purple-400 bg-purple-400/10 border-purple-400/30'}">
          {module?.level}
        </span>
        <span class="text-slate-500 text-sm">⏱️ {module?.estimated_minutes} min</span>
        <span class="text-slate-500 text-sm">⚡ {module?.xp_reward} XP</span>
      </div>

      <h1 class="text-3xl sm:text-4xl font-bold text-white mb-4">{module?.title}</h1>
      {#if module?.description}
        <p class="text-slate-400 text-lg leading-relaxed">{module.description}</p>
      {/if}
    </div>

    <!-- Content -->
    <div class="prose-custom space-y-6">
      {#each contentBlocks as block, i}
        {#if block.type === 'heading'}
          <h2 class="text-2xl font-bold text-white mt-10 mb-4">{block.content}</h2>
        {:else if block.type === 'paragraph'}
          <p class="text-slate-300 leading-relaxed text-lg">{block.content}</p>
        {:else if block.type === 'list'}
          <ul class="space-y-2">
            {#each block.content.split('\n').filter(Boolean) as item}
              <li class="flex gap-3 text-slate-300">
                <span class="text-orange-400 mt-1 flex-shrink-0">•</span>
                <span class="leading-relaxed">{item}</span>
              </li>
            {/each}
          </ul>
        {:else if block.type === 'code'}
          <div class="relative group">
            <div class="flex items-center justify-between bg-slate-800 px-4 py-2 rounded-t-xl border border-slate-700 border-b-0">
              <span class="text-slate-400 text-xs font-mono">{block.lang || 'code'}</span>
              <button
                on:click={() => handleCopy(i, block.content)}
                class="text-xs text-slate-400 hover:text-white transition px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600"
              >
                {copiedIndex === i ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <pre class="bg-[#0a0e14] border border-slate-700 border-t-0 rounded-b-xl p-6 overflow-x-auto"><code class="text-sm text-slate-200 font-mono leading-relaxed">{block.content}</code></pre>
          </div>
        {/if}
      {/each}
    </div>

    <!-- Complete button (bottom) -->
    {#if !completed}
      <div class="mt-16 p-6 bg-[#161b22] border border-slate-700 rounded-2xl text-center">
        <p class="text-slate-300 mb-4">Finished reading this module?</p>
        <button
          on:click={markComplete}
          disabled={saving}
          class="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition"
        >
          ✓ Mark as Complete — Earn {module?.xp_reward} XP
        </button>
      </div>
    {:else}
      <div class="mt-16 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
        <div class="text-3xl mb-2">🎉</div>
        <p class="text-green-400 font-bold text-lg mb-1">Module Complete!</p>
        <p class="text-slate-400 text-sm">You earned +{module?.xp_reward} XP</p>
      </div>
    {/if}

    <!-- Navigation -->
    <div class="mt-8 flex gap-4">
      {#if prevModule}
        <a
          href="/learn/{prevModule.slug}"
          class="flex-1 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition text-center text-sm"
        >
          ← {prevModule.title}
        </a>
      {/if}
      {#if nextModule}
        <a
          href="/learn/{nextModule.slug}"
          class="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition text-center text-sm"
        >
          Next: {nextModule.title} →
        </a>
      {/if}
    </div>
  </div>
</div>
