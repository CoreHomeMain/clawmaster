<script lang="ts">
  import '../app.css'
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'
  import type { LayoutData } from './$types'

  export let data: LayoutData

  $: ({ supabase, session } = data)

  onMount(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth')
      }
    })
    return () => subscription.unsubscribe()
  })
</script>

<slot />
