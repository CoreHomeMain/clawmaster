<script lang="ts">
  export let id: string
  export let title: string
  export let description: string
  export let icon: string
  export let xpReward: number
  export let earned: boolean = false
  export let hoverable: boolean = true

  const wrapperClass = earned
    ? 'bg-gradient-to-br from-orange-900/40 to-orange-900/20 border-orange-400/60 shadow-lg shadow-orange-500/20'
    : 'bg-slate-900/40 border-slate-700/40 opacity-50'

  const iconClass = earned ? 'text-3xl' : 'text-3xl grayscale opacity-50'
</script>

<div
  class={`
    rounded-xl border p-4 transition-all duration-200 cursor-pointer
    ${wrapperClass}
    ${hoverable && earned ? 'hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105' : ''}
    ${hoverable && !earned ? 'hover:opacity-60' : ''}
  `}
>
  <div class="flex items-start justify-between mb-2">
    <div class={iconClass}>{icon}</div>
    {#if earned}
      <div class="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded border border-orange-500/40">
        +{xpReward} XP
      </div>
    {/if}
  </div>

  <h3 class={`font-semibold mb-1 ${earned ? 'text-white' : 'text-slate-400'}`}>
    {title}
  </h3>

  <p class={`text-xs ${earned ? 'text-slate-300' : 'text-slate-500'}`}>
    {description}
  </p>

  {#if !earned}
    <div class="mt-3 text-xs text-slate-500 italic">
      🔒 Locked
    </div>
  {/if}
</div>
