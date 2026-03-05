<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  export let form: ActionData
</script>

<svelte:head>
  <title>Create Account — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <!-- Logo / Brand -->
    <div class="text-center mb-8">
      <a href="/" class="inline-flex items-center gap-2">
        <span class="text-3xl">🦞</span>
        <span class="text-2xl font-bold text-white">Claw<span class="text-orange-500">Master</span></span>
      </a>
      <p class="text-slate-400 mt-2 text-sm">Start your journey to OpenClaw mastery</p>
    </div>

    <!-- Card -->
    <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-8 shadow-xl">
      <h1 class="text-xl font-semibold text-white mb-6">Create your account</h1>

      {#if form?.error}
        <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {form.error}
        </div>
      {/if}

      {#if form?.success}
        <div class="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          Account created! Check your email to confirm, then sign in.
        </div>
      {/if}

      <form method="POST" use:enhance class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-300 mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-2.5 bg-[#0d1117] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="you@example.com"
            value={form?.email ?? ''}
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-300 mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autocomplete="new-password"
            minlength="8"
            class="w-full px-4 py-2.5 bg-[#0d1117] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="Min 8 characters"
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autocomplete="new-password"
            class="w-full px-4 py-2.5 bg-[#0d1117] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#161b22]"
        >
          Create Account
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-400">
        Already have an account?
        <a href="/login" class="text-orange-400 hover:text-orange-300 font-medium transition">Sign in</a>
      </p>
    </div>

    <p class="mt-4 text-center text-xs text-slate-500">
      Free account · No credit card required · 100 free credits on signup
    </p>
  </div>
</div>
