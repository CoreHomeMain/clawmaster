<script lang="ts">
  import { onMount, tick } from 'svelte'
  import type { PageData } from './$types'
  export let data: PageData

  interface Message {
    role: 'user' | 'assistant'
    content: string
    creditsUsed?: number
  }

  let messages: Message[] = []
  let input = ''
  let loading = false
  let error = ''
  let chatEl: HTMLDivElement
  let inputEl: HTMLTextAreaElement
  let conversationId: string | null = null
  let currentStreamContent = ''
  let credits = data.credits || 0
  let showSettings = false
  let byokKey = data.userOpenrouterKey || ''
  let savingKey = false

  const SUGGESTED_QUESTIONS = [
    'How do I connect Telegram to OpenClaw?',
    'What is SOUL.md and how do I configure it?',
    'How do I set up multi-agent routing?',
    'How do I create a custom skill?',
    'Why is my Discord bot offline?'
  ]

  async function createConversation() {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New conversation' })
    })
    if (res.ok) {
      const data = await res.json()
      conversationId = data.id
    }
  }

  async function sendMessage(content?: string) {
    const text = content || input.trim()
    if (!text || loading) return

    input = ''
    error = ''
    loading = true

    // Create conversation on first message
    if (!conversationId) {
      await createConversation()
    }

    messages = [...messages, { role: 'user', content: text }]
    await tick()
    scrollToBottom()

    // Add streaming placeholder
    messages = [...messages, { role: 'assistant', content: '' }]
    currentStreamContent = ''

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
          conversationId,
          userApiKey: byokKey || undefined
        })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || `Error ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              currentStreamContent += parsed.content
              messages[messages.length - 1] = {
                role: 'assistant',
                content: currentStreamContent
              }
              messages = messages // trigger reactivity
              await tick()
              scrollToBottom()
            }
          } catch {}
        }
      }

      // Refresh credits
      const profileRes = await fetch('/api/profile')
      if (profileRes.ok) {
        const profile = await profileRes.json()
        credits = profile.credits
      }
    } catch (e: any) {
      error = e.message || 'Failed to send message'
      messages = messages.slice(0, -1) // Remove empty assistant message
    }

    loading = false
    await tick()
    scrollToBottom()
    inputEl?.focus()
  }

  function scrollToBottom() {
    if (chatEl) {
      chatEl.scrollTop = chatEl.scrollHeight
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  async function saveByokKey() {
    savingKey = true
    await fetch('/api/profile/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openrouter_key: byokKey })
    })
    savingKey = false
    showSettings = false
  }

  // Format message content
  function formatMessage(content: string): string {
    // Convert code blocks
    content = content.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
      return `<div class="my-3"><div class="flex items-center justify-between bg-slate-800 px-3 py-1.5 rounded-t-lg text-xs text-slate-400">${lang || 'code'}</div><pre class="bg-[#0a0e14] border border-slate-700 border-t-0 rounded-b-lg p-4 overflow-x-auto"><code class="text-sm text-slate-200 font-mono">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()}</code></pre></div>`
    })
    // Inline code
    content = content.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Bold
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Newlines to <br>
    content = content.replace(/\n/g, '<br>')
    return content
  }
</script>

<svelte:head>
  <title>ClawBot AI — ClawMaster</title>
</svelte:head>

<div class="flex flex-col h-screen bg-[#0d1117]">
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
    <div class="flex items-center gap-3">
      <a href="/dashboard" class="text-slate-400 hover:text-white text-sm transition">← Dashboard</a>
      <span class="text-slate-700">|</span>
      <div class="flex items-center gap-2">
        <span class="text-xl">🦞</span>
        <span class="font-bold text-white">ClawBot</span>
        <span class="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">OpenClaw Expert</span>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="text-sm text-slate-400">
        <span class="text-orange-400 font-semibold">{credits}</span> credits
      </div>
      <button
        on:click={() => showSettings = !showSettings}
        class="text-slate-400 hover:text-white transition text-sm"
      >
        ⚙️ Settings
      </button>
    </div>
  </div>

  <!-- BYOK Settings Panel -->
  {#if showSettings}
    <div class="bg-[#161b22] border-b border-slate-700 px-6 py-4 flex-shrink-0">
      <h3 class="text-white font-semibold mb-3 text-sm">Bring Your Own Key (BYOK)</h3>
      <div class="flex gap-3 max-w-lg">
        <input
          type="password"
          placeholder="sk-or-v1-... (OpenRouter key)"
          bind:value={byokKey}
          class="flex-1 px-3 py-2 bg-[#0d1117] border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
        <button
          on:click={saveByokKey}
          disabled={savingKey}
          class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
        >
          {savingKey ? 'Saving...' : 'Save Key'}
        </button>
        {#if byokKey}
          <button
            on:click={() => { byokKey = ''; saveByokKey() }}
            class="px-4 py-2 border border-slate-600 text-slate-400 text-sm rounded-lg hover:border-slate-400 transition"
          >
            Clear
          </button>
        {/if}
      </div>
      <p class="text-xs text-slate-500 mt-2">Using your own key? Credits won't be deducted. Get a key at openrouter.ai</p>
    </div>
  {/if}

  <!-- Messages -->
  <div bind:this={chatEl} class="flex-1 overflow-y-auto px-4 py-6">
    <div class="max-w-3xl mx-auto space-y-6">

      {#if messages.length === 0}
        <!-- Welcome state -->
        <div class="text-center py-12">
          <div class="text-5xl mb-4">🦞</div>
          <h2 class="text-2xl font-bold text-white mb-2">Ask ClawBot Anything</h2>
          <p class="text-slate-400 mb-8">I'm an OpenClaw specialist. Ask me anything about setup, configuration, channels, skills, and more.</p>

          <div class="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
            {#each SUGGESTED_QUESTIONS as question}
              <button
                on:click={() => sendMessage(question)}
                class="text-left px-4 py-3 bg-[#161b22] border border-slate-700 hover:border-orange-500/50 rounded-xl text-sm text-slate-300 hover:text-white transition"
              >
                {question}
              </button>
            {/each}
          </div>
        </div>
      {:else}
        {#each messages as message, i}
          <div class="flex gap-3 {message.role === 'user' ? 'justify-end' : 'justify-start'}">
            {#if message.role === 'assistant'}
              <div class="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">🦞</div>
            {/if}

            <div class="max-w-[85%] {message.role === 'user'
              ? 'bg-slate-700 text-white rounded-2xl rounded-tr-sm px-4 py-3'
              : 'bg-[#161b22] border border-slate-700 text-slate-200 rounded-2xl rounded-tl-sm px-4 py-3'
            }">
              {#if message.role === 'assistant'}
                <div class="prose-custom text-sm leading-relaxed">
                  {#if message.content}
                    {@html formatMessage(message.content)}
                  {:else if loading && i === messages.length - 1}
                    <div class="flex gap-1 py-1">
                      <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                      <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                      <div class="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                  {/if}
                </div>
              {:else}
                <p class="text-sm leading-relaxed">{message.content}</p>
              {/if}
            </div>

            {#if message.role === 'user'}
              <div class="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm flex-shrink-0 mt-1">👤</div>
            {/if}
          </div>
        {/each}
      {/if}

      {#if error}
        <div class="max-w-3xl mx-auto p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      {/if}
    </div>
  </div>

  <!-- Input area -->
  <div class="border-t border-slate-800 px-4 py-4 flex-shrink-0">
    <div class="max-w-3xl mx-auto">
      <div class="flex gap-3 items-end">
        <div class="flex-1 bg-[#161b22] border border-slate-700 focus-within:border-orange-500 rounded-2xl transition">
          <textarea
            bind:this={inputEl}
            bind:value={input}
            on:keydown={handleKeydown}
            placeholder="Ask ClawBot anything about OpenClaw..."
            rows="1"
            class="w-full bg-transparent px-4 py-3 text-white placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed"
            style="max-height: 120px;"
          ></textarea>
        </div>
        <button
          on:click={() => sendMessage()}
          disabled={!input.trim() || loading}
          class="w-10 h-10 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition flex items-center justify-center flex-shrink-0"
        >
          {#if loading}
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {:else}
            ↑
          {/if}
        </button>
      </div>
      <p class="text-xs text-slate-600 mt-2 text-center">
        ClawBot uses {byokKey ? 'your OpenRouter key' : `platform credits (${credits} remaining)`} · Powered by MiniMax M2.5
      </p>
    </div>
  </div>
</div>
