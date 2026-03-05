<script lang="ts">
  import type { PageData } from './$types'
  export let data: PageData
</script>

<svelte:head>
  <title>ClawMaster — Master OpenClaw</title>
</svelte:head>

<main class="min-h-screen bg-gray-950 flex items-center justify-center">
  <div class="text-center px-6">
    <div class="text-6xl mb-6">🦞</div>
    <h1 class="text-5xl font-bold text-white mb-4">
      Claw<span class="text-blue-500">Master</span>
    </h1>
    <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
      The world's best platform for learning, configuring, and mastering OpenClaw.
    </p>
    <div class="flex gap-4 justify-center">
      <a href="/register" class="btn-primary text-lg px-8 py-3 inline-block rounded-lg">
        Get Started Free
      </a>
      <a href="/learn" class="btn-secondary text-lg px-8 py-3 inline-block rounded-lg">
        Browse Modules
      </a>
    </div>
    {#if data.session}
      <p class="mt-6 text-gray-500">
        Welcome back! <a href="/dashboard" class="text-blue-400 hover:underline">Go to Dashboard →</a>
      </p>
    {/if}
  </div>
</main>
