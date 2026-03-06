<script lang="ts">
  import '../app.css'
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'
  import type { LayoutData } from './$types'
  import AchievementNotification from '$lib/components/AchievementNotification.svelte'
  import { checkAndShowAchievements } from '$lib/check-achievements'

  export let data: LayoutData

  $: ({ supabase, session } = data)

  let notifications: any[] = []

  onMount(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })

    // Listen for achievement notifications
    const notificationHandler = (event: CustomEvent) => {
      const notification = event.detail
      notifications = [...notifications, notification]
      setTimeout(() => {
        notifications = notifications.filter(n => n.id !== notification.id)
      }, 4500)
    }

    window.addEventListener('achievement:unlocked', notificationHandler as EventListener)

    // Check for unnotified achievements on mount
    checkAndShowAchievements()

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('achievement:unlocked', notificationHandler as EventListener)
    }
  })
</script>

<slot />

{#each notifications as notification (notification.id)}
  <AchievementNotification
    icon={notification.icon}
    title={notification.title}
    description={notification.description}
    xpReward={notification.xpReward}
  />
{/each}
