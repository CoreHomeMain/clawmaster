<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData
</script>

<svelte:head>
  <title>ClawMaster — Master OpenClaw in Days, Not Months</title>
  <meta name="description" content="The interactive learning platform for OpenClaw. Step-by-step guides, AI assistant, config wizards, and gamified progress tracking." />
</svelte:head>

<!-- NAV -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/90 backdrop-blur border-b border-slate-800">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
    <a href="/" class="flex items-center gap-2">
      <span class="text-2xl">🦞</span>
      <span class="text-xl font-bold text-white">Claw<span class="text-orange-500">Master</span></span>
    </a>
    <div class="flex items-center gap-4">
      {#if data?.session}
        <a href="/dashboard" class="text-slate-300 hover:text-white text-sm transition">Dashboard</a>
      {:else}
        <a href="/login" class="text-slate-300 hover:text-white text-sm transition">Sign In</a>
        <a href="/register" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition">
          Get Started Free
        </a>
      {/if}
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 pt-16">
  <div class="max-w-4xl mx-auto text-center">
    <div class="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm px-4 py-1.5 rounded-full mb-6">
      <span>🦞</span>
      <span>The #1 OpenClaw Learning Platform</span>
    </div>

    <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
      Master OpenClaw in<br/>
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Days, Not Months</span>
    </h1>

    <p class="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
      Interactive tutorials, AI-powered assistance, and visual config wizards. 
      Go from zero to fully operational in your first session.
    </p>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/register" class="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl transition shadow-lg shadow-orange-900/30">
        Start Learning Free →
      </a>
      <a href="#how-it-works" class="px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold text-lg rounded-xl transition">
        See How It Works
      </a>
    </div>

    <p class="mt-6 text-slate-500 text-sm">Free to start · $19 one-time for full access · No subscription</p>

    <!-- Hero visual -->
    <div class="mt-16 relative max-w-3xl mx-auto">
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6 text-left shadow-2xl">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <span class="ml-2 text-slate-500 text-xs">ClawBot AI Assistant</span>
        </div>
        <div class="space-y-3">
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm flex-shrink-0">👤</div>
            <div class="bg-slate-800 rounded-xl rounded-tl-none px-4 py-2 text-slate-300 text-sm">
              How do I connect Telegram to OpenClaw?
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <div class="bg-orange-600/20 border border-orange-500/30 rounded-xl rounded-tr-none px-4 py-2 text-slate-200 text-sm max-w-sm">
              To connect Telegram, first create a bot via @BotFather, get your token, then add it to your OpenClaw config under <code class="text-orange-400">channels.telegram.token</code>. Here's exactly how... 🦞
            </div>
            <div class="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-sm flex-shrink-0">🦞</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section id="features" class="py-24 bg-[#0d1117] px-4">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need to Master OpenClaw</h2>
      <p class="text-slate-400 text-lg max-w-2xl mx-auto">Not just docs. An interactive learning system that meets you where you are.</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Feature 1 -->
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition group">
        <div class="text-3xl mb-4">📚</div>
        <h3 class="text-white font-bold text-lg mb-2 group-hover:text-orange-400 transition">15 Structured Modules</h3>
        <p class="text-slate-400 text-sm leading-relaxed">From "What is OpenClaw?" to building custom skills. Learn at your own pace with interactive exercises and progress tracking.</p>
      </div>

      <!-- Feature 2 -->
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition group">
        <div class="text-3xl mb-4">🤖</div>
        <h3 class="text-white font-bold text-lg mb-2 group-hover:text-orange-400 transition">ClawBot AI Tutor</h3>
        <p class="text-slate-400 text-sm leading-relaxed">An AI that knows OpenClaw inside-out. Ask anything — get expert answers, config help, and code examples instantly.</p>
      </div>

      <!-- Feature 3 -->
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition group">
        <div class="text-3xl mb-4">⚙️</div>
        <h3 class="text-white font-bold text-lg mb-2 group-hover:text-orange-400 transition">Config Wizards</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Visual step-by-step wizards for Gateway setup, channel connections, and agent configuration. Copy-paste ready output.</p>
      </div>

      <!-- Feature 4 -->
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6 hover:border-orange-500/50 transition group">
        <div class="text-3xl mb-4">🏆</div>
        <h3 class="text-white font-bold text-lg mb-2 group-hover:text-orange-400 transition">XP & Achievements</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Earn XP and badges as you learn. Gamified progress keeps you motivated. Track your journey from beginner to power user.</p>
      </div>
    </div>
  </div>
</section>

<!-- HOW IT WORKS -->
<section id="how-it-works" class="py-24 bg-[#0a0e14] px-4">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">From Zero to Operational in 3 Steps</h2>
      <p class="text-slate-400 text-lg">No fluff. Just the fastest path to a working OpenClaw setup.</p>
    </div>

    <div class="space-y-8">
      <!-- Step 1 -->
      <div class="flex gap-6 items-start">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xl">1</div>
        <div>
          <h3 class="text-white font-bold text-xl mb-2">Take the Onboarding Quiz</h3>
          <p class="text-slate-400 leading-relaxed">5 quick questions about your skill level, goals, and setup. We personalize your learning path — no one-size-fits-all curriculum here.</p>
        </div>
      </div>

      <div class="ml-6 border-l-2 border-slate-800 h-8"></div>

      <!-- Step 2 -->
      <div class="flex gap-6 items-start">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xl">2</div>
        <div>
          <h3 class="text-white font-bold text-xl mb-2">Follow Your Learning Path</h3>
          <p class="text-slate-400 leading-relaxed">Interactive modules with one-click copy code blocks, progress tracking, and XP rewards. Learn concepts, then immediately apply them.</p>
        </div>
      </div>

      <div class="ml-6 border-l-2 border-slate-800 h-8"></div>

      <!-- Step 3 -->
      <div class="flex gap-6 items-start">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xl">3</div>
        <div>
          <h3 class="text-white font-bold text-xl mb-2">Ask ClawBot When Stuck</h3>
          <p class="text-slate-400 leading-relaxed">Our AI tutor is available 24/7. It knows every config option, common errors, and edge cases. Never get stuck for more than a minute.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section id="pricing" class="py-24 bg-[#0d1117] px-4">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
    <p class="text-slate-400 text-lg mb-12">Start free. Upgrade once. Own it forever.</p>

    <div class="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      <!-- Free -->
      <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8 text-left">
        <h3 class="text-white font-bold text-xl mb-2">Free</h3>
        <div class="text-4xl font-extrabold text-white mb-1">$0</div>
        <p class="text-slate-500 text-sm mb-6">Forever free</p>
        <ul class="space-y-3 text-sm text-slate-300 mb-8">
          <li class="flex gap-2"><span class="text-green-400">✓</span> 3 beginner modules</li>
          <li class="flex gap-2"><span class="text-green-400">✓</span> 100 ClawBot credits</li>
          <li class="flex gap-2"><span class="text-green-400">✓</span> Onboarding quiz</li>
          <li class="flex gap-2"><span class="text-slate-600">✗</span> Full module library</li>
          <li class="flex gap-2"><span class="text-slate-600">✗</span> Config wizards</li>
        </ul>
        <a href="/register" class="block w-full py-3 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-xl transition text-center">
          Start Free
        </a>
      </div>

      <!-- Full Access -->
      <div class="bg-gradient-to-b from-orange-900/20 to-[#161b22] border-2 border-orange-500 rounded-2xl p-8 text-left relative">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</div>
        <h3 class="text-white font-bold text-xl mb-2">Full Access</h3>
        <div class="text-4xl font-extrabold text-white mb-1">$19</div>
        <p class="text-slate-500 text-sm mb-6">One-time · Lifetime access</p>
        <ul class="space-y-3 text-sm text-slate-300 mb-8">
          <li class="flex gap-2"><span class="text-orange-400">✓</span> All 15 modules</li>
          <li class="flex gap-2"><span class="text-orange-400">✓</span> 1,000 ClawBot credits</li>
          <li class="flex gap-2"><span class="text-orange-400">✓</span> All config wizards</li>
          <li class="flex gap-2"><span class="text-orange-400">✓</span> Achievement system</li>
          <li class="flex gap-2"><span class="text-orange-400">✓</span> Future modules free</li>
        </ul>
        <a href="/checkout" class="block w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition text-center shadow-lg shadow-orange-900/40">
          Get Full Access →
        </a>
      </div>
    </div>

    <p class="mt-8 text-slate-500 text-sm">PayPal secure checkout · 30-day money-back guarantee</p>
  </div>
</section>

<!-- FAQ -->
<section id="faq" class="py-24 bg-[#0a0e14] px-4">
  <div class="max-w-3xl mx-auto">
    <h2 class="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>

    <div class="space-y-4">
      {#each [
        { q: 'What is OpenClaw?', a: 'OpenClaw is a self-hosted AI gateway that connects your favorite chat apps (Telegram, Discord, WhatsApp, etc.) to powerful AI agents. Think of it as your personal AI infrastructure — running on your machine, under your control.' },
        { q: 'Do I need to know programming?', a: 'No! ClawMaster is designed for everyone. Our beginner track assumes zero technical knowledge and guides you step by step. Advanced modules require basic command-line comfort, but we explain everything.' },
        { q: 'What does "one-time payment" mean?', a: 'You pay $19 once and get lifetime access. No monthly fees, no subscription, no surprise charges. All future modules added to the platform are also free for lifetime members.' },
        { q: 'What is ClawBot?', a: 'ClawBot is our AI assistant powered by the latest AI models. Unlike generic AI, ClawBot is specifically trained on OpenClaw documentation, config options, and common issues. It gives expert-level answers instantly.' },
        { q: 'What if I already have OpenClaw installed?', a: 'Perfect! Take the onboarding quiz and select "intermediate" — we\'ll skip the basics and jump straight to advanced configuration, multi-agent setup, and power-user features.' },
      ] as faq}
        <div class="bg-[#161b22] border border-slate-700 rounded-xl p-6">
          <h3 class="text-white font-semibold mb-2">{faq.q}</h3>
          <p class="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-24 bg-[#0d1117] px-4">
  <div class="max-w-3xl mx-auto text-center">
    <div class="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-3xl p-12">
      <div class="text-5xl mb-4">🦞</div>
      <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Master OpenClaw?</h2>
      <p class="text-slate-400 text-lg mb-8">Join hundreds of users who went from confused to confident with ClawMaster.</p>
      <a href="/register" class="inline-block px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl transition shadow-lg shadow-orange-900/40">
        Start Learning Free →
      </a>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer class="bg-[#0a0e14] border-t border-slate-800 py-12 px-4">
  <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <span class="text-xl">🦞</span>
      <span class="text-slate-400 text-sm">ClawMaster · The OpenClaw Learning Platform</span>
    </div>
    <div class="flex gap-6 text-sm text-slate-500">
      <a href="/login" class="hover:text-slate-300 transition">Sign In</a>
      <a href="/register" class="hover:text-slate-300 transition">Sign Up</a>
      <a href="#faq" class="hover:text-slate-300 transition">FAQ</a>
    </div>
  </div>
</footer>
