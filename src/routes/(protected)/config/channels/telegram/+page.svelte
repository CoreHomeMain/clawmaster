<script lang="ts">
  let step = 1
  const totalSteps = 4
  let botToken = ''
  let botUsername = ''
  let allowGroups = false
  let copied = ''

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    copied = key
    setTimeout(() => { copied = '' }, 2000)
  }

  function generateConfig() {
    return `{
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "${botToken || 'YOUR_BOT_TOKEN_HERE'}",
      "allow_groups": ${allowGroups}
    }
  }
}`
  }

  function generateCommand() {
    return `openclaw config set channels.telegram.token "${botToken || 'YOUR_BOT_TOKEN_HERE'}"
openclaw config set channels.telegram.allow_groups ${allowGroups}
openclaw gateway restart`
  }
</script>

<svelte:head>
  <title>Telegram Setup — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117]">
  <nav class="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
    <a href="/config" class="text-slate-400 hover:text-white text-sm transition">← Config Wizards</a>
    <span class="text-slate-700">|</span>
    <span class="text-white font-semibold">✈️ Telegram Setup</span>
  </nav>

  <div class="max-w-2xl mx-auto px-4 py-12">
    <div class="mb-8">
      <div class="flex justify-between text-xs text-slate-500 mb-2">
        <span>Step {step} of {totalSteps}</span>
        <span>{Math.round((step / totalSteps) * 100)}%</span>
      </div>
      <div class="h-2 bg-slate-800 rounded-full">
        <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all" style="width: {(step / totalSteps) * 100}%"></div>
      </div>
    </div>

    {#if step === 1}
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8">
        <h2 class="text-white text-xl font-bold mb-4">Step 1: Create Your Telegram Bot</h2>
        <ol class="space-y-4 text-slate-300">
          <li class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <div>Open Telegram and search for <code class="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-sm">@BotFather</code></div>
          </li>
          <li class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <div>Send the command: <code class="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-sm">/newbot</code></div>
          </li>
          <li class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <div>Choose a display name (e.g. "My Assistant")</div>
          </li>
          <li class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <div>Choose a username (must end in <code class="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-sm">bot</code>, e.g. <code class="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-sm">my_assistant_bot</code>)</div>
          </li>
          <li class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
            <div>BotFather will give you a <strong class="text-white">token</strong> — copy it for the next step</div>
          </li>
        </ol>
      </div>

    {:else if step === 2}
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8">
        <h2 class="text-white text-xl font-bold mb-2">Step 2: Enter Your Bot Token</h2>
        <p class="text-slate-400 text-sm mb-6">Paste the token BotFather gave you. It looks like: <code class="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-sm">123456789:ABCdef...</code></p>
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-amber-300 text-sm">
          ⚠️ Keep your token secret — it controls your bot!
        </div>
        <input
          type="password"
          bind:value={botToken}
          placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
          class="w-full px-4 py-3 bg-[#0d1117] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
        />
        <p class="text-slate-500 text-xs mt-2">Optional: Enter your bot's username for verification</p>
        <input
          type="text"
          bind:value={botUsername}
          placeholder="@my_bot_username"
          class="w-full mt-2 px-4 py-3 bg-[#0d1117] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
        />
      </div>

    {:else if step === 3}
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8">
        <h2 class="text-white text-xl font-bold mb-2">Step 3: Configure Options</h2>
        <p class="text-slate-400 text-sm mb-6">Choose how your bot behaves.</p>
        <div class="space-y-4">
          <label class="flex items-center gap-3 p-4 bg-[#0d1117] rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition">
            <input type="checkbox" bind:checked={allowGroups} class="w-4 h-4 text-orange-500 rounded" />
            <div>
              <p class="text-white font-medium">Allow group chats</p>
              <p class="text-slate-400 text-sm">Let your bot respond in Telegram groups (not just DMs)</p>
            </div>
          </label>
        </div>
      </div>

    {:else if step === 4}
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8">
        <h2 class="text-white text-xl font-bold mb-2">🎉 Telegram Config Ready!</h2>
        <p class="text-slate-400 text-sm mb-6">Run these commands to connect Telegram to your Gateway.</p>

        <div class="mb-4">
          <div class="flex items-center justify-between bg-slate-800 px-3 py-2 rounded-t-lg">
            <span class="text-slate-400 text-xs">Terminal commands</span>
            <button on:click={() => copy(generateCommand(), 'cmd')} class="text-xs text-slate-400 hover:text-white px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded transition">
              {copied === 'cmd' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <pre class="bg-[#0a0e14] border border-slate-700 border-t-0 rounded-b-lg p-4 text-sm text-slate-200 font-mono whitespace-pre-wrap">{generateCommand()}</pre>
        </div>

        <div class="mb-4">
          <div class="flex items-center justify-between bg-slate-800 px-3 py-2 rounded-t-lg">
            <span class="text-slate-400 text-xs">Or add to config.json directly</span>
            <button on:click={() => copy(generateConfig(), 'json')} class="text-xs text-slate-400 hover:text-white px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded transition">
              {copied === 'json' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <pre class="bg-[#0a0e14] border border-slate-700 border-t-0 rounded-b-lg p-4 text-sm text-slate-200 font-mono whitespace-pre-wrap">{generateConfig()}</pre>
        </div>

        <div class="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400">
          ✅ After running these commands, search for {botUsername || 'your bot'} in Telegram and send a message!
        </div>
      </div>
    {/if}

    {#if step < totalSteps}
      <div class="flex gap-4 mt-6">
        {#if step > 1}
          <button on:click={() => step--} class="flex-1 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 font-semibold rounded-xl transition">← Back</button>
        {/if}
        <button
          on:click={() => step++}
          disabled={step === 2 && !botToken}
          class="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition"
        >
          Next →
        </button>
      </div>
    {/if}
  </div>
</div>
