<script lang="ts">
  const wizards = [
    {
      slug: 'gateway',
      title: 'Gateway Setup',
      description: '5-step wizard to get your OpenClaw Gateway running. Covers installation, API keys, model selection, and first start.',
      icon: '⚡',
      steps: 5,
      href: '/config/gateway'
    },
    {
      slug: 'telegram',
      title: 'Telegram Channel',
      description: 'Connect Telegram to your gateway — BotFather setup, token configuration, and first message test.',
      icon: '✈️',
      steps: 4,
      href: '/config/channels/telegram'
    },
    {
      slug: 'discord',
      title: 'Discord Bot',
      description: 'Set up your Discord bot — application creation, permissions, OAuth2, and server integration.',
      icon: '💬',
      steps: 5,
      href: '/config/channels/discord'
    }
  ]
</script>

<svelte:head>
  <title>Config Wizards — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117]">
  <nav class="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2">
      <span class="text-xl">🦞</span>
      <span class="font-bold text-white">Claw<span class="text-orange-500">Master</span></span>
    </a>
    <div class="flex gap-6 text-sm">
      <a href="/dashboard" class="text-slate-400 hover:text-white transition">Dashboard</a>
      <a href="/learn" class="text-slate-400 hover:text-white transition">Learn</a>
      <a href="/chat" class="text-slate-400 hover:text-white transition">ClawBot</a>
      <a href="/config" class="text-orange-400 font-medium">Config</a>
    </div>
  </nav>

  <div class="max-w-4xl mx-auto px-4 py-12">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-white mb-2">⚙️ Config Wizards</h1>
      <p class="text-slate-400">Step-by-step setup wizards. Copy-paste ready configurations generated at the end.</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each wizards as wizard}
        <a
          href={wizard.href}
          class="bg-[#161b22] border border-slate-700 hover:border-orange-500/50 rounded-2xl p-6 transition group block"
        >
          <div class="text-4xl mb-4">{wizard.icon}</div>
          <h3 class="text-white font-bold text-lg mb-2 group-hover:text-orange-400 transition">{wizard.title}</h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-4">{wizard.description}</p>
          <div class="flex items-center justify-between">
            <span class="text-slate-500 text-xs">{wizard.steps} steps</span>
            <span class="text-orange-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">Start →</span>
          </div>
        </a>
      {/each}
    </div>

    <div class="mt-12 p-6 bg-[#161b22] border border-slate-700 rounded-2xl">
      <h2 class="text-white font-bold mb-2">🤖 Need help with a different setup?</h2>
      <p class="text-slate-400 text-sm mb-4">ClawBot knows every OpenClaw config option. Ask it anything!</p>
      <a href="/chat" class="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition text-sm">
        Ask ClawBot →
      </a>
    </div>
  </div>
</div>
