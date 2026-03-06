<script lang="ts">
  import { onMount } from 'svelte'

  export let icon: string = '🏆'
  export let title: string = 'Achievement Unlocked'
  export let description: string = ''
  export let xpReward: number = 0
  export let duration: number = 4000

  let visible = true

  onMount(() => {
    const timer = setTimeout(() => {
      visible = false
    }, duration)

    return () => clearTimeout(timer)
  })
</script>

{#if visible}
  <div
    class="fixed bottom-4 right-4 animate-slideInUp max-w-sm"
    role="alert"
    aria-live="polite"
    transition:fade
  >
    <div class="bg-gradient-to-r from-orange-600 to-orange-500 rounded-xl border border-orange-400/60 p-4 shadow-lg shadow-orange-500/40">
      <div class="flex items-start gap-3">
        <div class="text-3xl">{icon}</div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-white text-sm mb-1">
            🎉 {title}
          </h3>
          <p class="text-sm text-orange-100 mb-2">
            {description}
          </p>
          <div class="flex items-center gap-1 text-xs font-semibold text-white">
            <span>⚡ +{xpReward} XP</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <style>
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(100px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :global(.animate-slideInUp) {
      animation: slideInUp 0.3s ease-out;
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(100px);
      }
    }

    :global(.animate-slideOutDown) {
      animation: fadeOut 0.3s ease-out;
    }
  </style>
{/if}
