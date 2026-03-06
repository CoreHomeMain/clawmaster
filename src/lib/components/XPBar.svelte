<script lang="ts">
  export let totalXp: number = 0
  export let level: number = 1
  export let showLabel: boolean = true

  // Calculate progress to next level
  const xpForCurrentLevel = (level - 1) * 500
  const xpForNextLevel = level * 500
  const xpInLevel = totalXp - xpForCurrentLevel
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel
  const progressPercent = Math.min(100, (xpInLevel / xpNeededForLevel) * 100)

  const getLevelColor = (lvl: number) => {
    if (lvl <= 2) return 'from-green-500 to-green-600'
    if (lvl <= 5) return 'from-blue-500 to-blue-600'
    if (lvl <= 10) return 'from-purple-500 to-purple-600'
    return 'from-orange-500 to-red-600'
  }
</script>

<div class="space-y-2">
  {#if showLabel}
    <div class="flex items-center justify-between text-sm">
      <span class="font-semibold text-white">
        Level <span class="text-lg text-orange-400">{level}</span>
      </span>
      <span class="text-xs text-slate-400">
        {xpInLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
      </span>
    </div>
  {/if}

  <div class="relative h-3 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50">
    <div
      class="h-full bg-gradient-to-r {getLevelColor(level)} transition-all duration-300 rounded-full shadow-lg shadow-orange-500/40"
      style="width: {progressPercent}%"
    />
  </div>

  <div class="text-xs text-slate-500 text-center">
    Total XP: {totalXp.toLocaleString()}
  </div>
</div>

<style>
  :global(.xp-bar-animated) {
    transition: width 0.3s ease-out;
  }
</style>
