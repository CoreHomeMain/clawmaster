<script lang="ts">
  let step = 1
  const totalSteps = 5
  let botToken = ''
  let clientId = ''
  let guildId = ''
  let copied = ''

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    copied = key
    setTimeout(() => { copied = '' }, 2000)
  }

  $: oauthUrl = clientId ? `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=2147483647&scope=bot%20applications.commands` : ''

  function generateConfig() {
    return `{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "${botToken || 'YOUR_BOT_TOKEN_HERE'}"${guildId ? `,\n      "allowed_guilds": ["${guildId}"]` : ''}
    }
  }
}`
  }

  function generateCommand() {
    return `openclaw config set channels.discord.token "${botToken || 'YOUR_BOT_TOKEN_HERE'}"
openclaw gateway restart`
  }
</script>

<svelte:head>
  <title>Discord Setup — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117]">
  <nav class="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
    <a href="/config" class="text-slate-400 hover:text-white text-sm transition">← Config Wizards</a>
    <span class="text-slate-700">|</span>
    <span class="text-white font-semibold">💬 Discord Bot Setup</span>
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
        <h2 class="text-white text-xl font-bold mb-4">Step 1: Create a Discord Application</h2>
        <ol class="space-y-4 text-slate-300">
          {#each [
            ['Go to', 'https://discord.com/developers/applications', 'Discord Developer Portal'],
            ['Click', '"New Application"', ''],
            ['Give your app a name', '(e.g. "My OpenClaw Bot")', ''],
            ['Click "Create"', '', '']
          ] as [action, detail, link]}
            <li class="flex gap-3 items-start">
              <span class="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-2"></span>
              <div>{action} {#if link}<a href="https://discord.com/developers/applications" target="_blank" class="text-orange-400 hover:underline">{detail}</a>{:else}<code class="bg-slate-800 text-orange-300 px-1.5 py-0.5 rounded text-sm">{detail}</code>{/if}</div>
            </li>
          {/each}
        </ol>
        <p class="text-slate-400 text-sm mt-4">Note your Application ID (Client ID) — you'll need it later.</p>
        <input
          type="text"
          bind:value={clientId}
          placeholder="Your Application/Client ID (18-digit number)"
          class="w-full mt-3 px-4 py-3 bg-[#0d1117] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono"
        />
      </div>

    {:else if step === 2}
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8">
        <h2 class="text-white text-xl font-bold mb-4">Step 2: Create the Bot</h2>
        <ol class="space-y-4 text-slate-300 text-sm">
          <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">1</span> In your application, click the <strong class="text-white">Bot</strong> section in the sidebar</li>
          <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">2</span> Click <strong class="text-white">"Add Bot"</strong> → "Yes, do it!"</li>
          <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">3</span> Under <strong class="text-white">Privileged Gateway Intents</strong>, enable: <code class="bg-slate-800 text-orange-300 px-1 rounded">Message Content Intent</code></li>
          <li class="flex gap-3"><span class="w-6 h-6 rounded-full bg-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">4</span> Click <strong class="text-white">Reset Token</strong> and copy your bot token</li>
        </ol>
        <div class="mt-6">
          <input
            type="password"
            bind:value={botToken}
            placeholder="Paste your bot token here"
            class="w-full px-4 py-3 bg-[#0d1117] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
          />
          <p class="text-amber-400 text-xs mt-2">⚠️ Never share your bot token with anyone</p>
        </div>
      </div>

    {:else if step === 3}
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8">
        <h2 class="text-white text-xl font-bold mb-4">Step 3: Invite Bot to Your Server</h2>
        {#if oauthUrl}
          <p class="text-slate-400 text-sm mb-4">Click the button below to invite your bot to your Discord server:</p>
          <a href={oauthUrl} target="_blank" class="block w-full text-center py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl transition mb-4">
            💬 Invite Bot to Discord
          </a>
        {:else}
          <p class="text-slate-400 text-sm mb-4">Go back to step 1 and enter your Client ID to generate the invite link, or create it manually:</p>
          <ol class="space-y-2 text-slate-300 text-sm">
            <li class="flex gap-2"><span>1.</span> Go to your application → OAuth2 → URL Generator</li>
            <li class="flex gap-2"><span>2.</span> Select scopes: <code class="bg-slate-800 text-orange-300 px-1 rounded">bot</code> and <code class="bg-slate-800 text-orange-300 px-1 rounded">applications.commands</code></li>
            <li class="flex gap-2"><span>3.</span> Select "Administrator" permissions (or specific permissions)</li>
            <li class="flex gap-2"><span>4.</span> Copy and open the generated URL</li>
          </ol>
        {/if}
        <div class="mt-4">
          <label class="block text-slate-400 text-sm mb-2">Your server ID (optional, for restricting access):</label>
          <input
            type="text"
            bind:value={guildId}
            placeholder="Your Discord server/guild ID"
            class="w-full px-4 py-3 bg-[#0d1117] border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono"
          />
          <p class="text-slate-500 text-xs mt-1">Enable Developer Mode in Discord settings → right-click your server → Copy ID</p>
        </div>
      </div>

    {:else if step === 4}
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8">
        <h2 class="text-white text-xl font-bold mb-4">Step 4: Verify Setup</h2>
        <p class="text-slate-400 text-sm mb-6">After adding the bot to your server, verify these items:</p>
        <div class="space-y-3">
          {#each [
            'Bot appears in your server member list (offline is fine for now)',
            'Bot has permissions to read and send messages in at least one channel',
            'Message Content Intent is enabled in the Developer Portal',
            'You have your bot token ready for the next step'
          ] as item}
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 text-orange-500 rounded mt-0.5" />
              <span class="text-slate-300 text-sm">{item}</span>
            </label>
          {/each}
        </div>
      </div>

    {:else if step === 5}
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8">
        <h2 class="text-white text-xl font-bold mb-2">🎉 Discord Config Ready!</h2>
        <p class="text-slate-400 text-sm mb-6">Run these commands to connect Discord to your Gateway.</p>

        <div class="mb-4">
          <div class="flex items-center justify-between bg-slate-800 px-3 py-2 rounded-t-lg">
            <span class="text-slate-400 text-xs">Terminal</span>
            <button on:click={() => copy(generateCommand(), 'cmd')} class="text-xs text-slate-400 hover:text-white px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded transition">
              {copied === 'cmd' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <pre class="bg-[#0a0e14] border border-slate-700 border-t-0 rounded-b-lg p-4 text-sm text-slate-200 font-mono whitespace-pre-wrap">{generateCommand()}</pre>
        </div>

        <div class="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-400 mb-4">
          ✅ After restart, your bot will appear ONLINE in Discord. Send it a DM or mention it in a channel!
        </div>
      </div>
    {/if}

    {#if step < totalSteps}
      <div class="flex gap-4 mt-6">
        {#if step > 1}
          <button on:click={() => step--} class="flex-1 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl transition hover:border-slate-500">← Back</button>
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
