<script lang="ts">
  import { onMount } from 'svelte'
  import type { PageData } from './$types'
  export let data: PageData

  const PAYPAL_CLIENT_ID = 'AUiYRKG9S7jVTBUtADUmXQC5XEIkCk6172Me94ih1FCycg_Z_fZCf1vAqs9ecE_jyHsr1Q3AZbbQuuRS'
  
  let paypalLoaded = false
  let processing = false
  let paypalError = ''
  let paypalContainerEl: HTMLDivElement | null = null

  onMount(async () => {
    console.log('[PayPal] Starting PayPal setup...')
    
    try {
      // Load PayPal JS SDK
      await new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector('script[src*="paypal.com/sdk"]')
        if (existingScript) {
          console.log('[PayPal] SDK already loaded')
          resolve()
          return
        }
        
        const script = document.createElement('script')
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&enable-funding=paylater`
        script.onload = () => {
          console.log('[PayPal] SDK script loaded')
          resolve()
        }
        script.onerror = (e) => {
          console.error('[PayPal] SDK script error:', e)
          reject(new Error('Failed to load PayPal SDK'))
        }
        document.head.appendChild(script)
      })

      // Wait a bit for PayPal to initialize
      await new Promise(r => setTimeout(r, 500))

      // @ts-ignore
      if (!window.paypal || !window.paypal.Buttons) {
        console.error('[PayPal] window.paypal.Buttons not available:', window.paypal)
        throw new Error('PayPal SDK loaded but buttons not available')
      }

      console.log('[PayPal] Rendering buttons...')

      // @ts-ignore
      const buttons = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay'
        },

        async createOrder() {
          console.log('[PayPal] Creating order...')
          try {
            const res = await fetch('/api/payments/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            })
            const order = await res.json()
            console.log('[PayPal] Order response:', order)
            if (!order.id) {
              throw new Error('No order ID returned from server')
            }
            return order.id
          } catch (err) {
            console.error('[PayPal] Create order error:', err)
            paypalError = 'Failed to create order. Please refresh and try again.'
            throw err
          }
        },

        async onApprove(data: { orderID: string }) {
          console.log('[PayPal] Order approved:', data)
          processing = true
          paypalError = ''
          try {
            const res = await fetch('/api/payments/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID })
            })
            const result = await res.json()
            console.log('[PayPal] Capture result:', result)
            if (result.success) {
              window.location.href = '/dashboard?payment=success'
            } else {
              paypalError = result.error || 'Payment could not be completed. Please contact support.'
              processing = false
            }
          } catch (e) {
            console.error('[PayPal] Capture error:', e)
            paypalError = 'Payment error. Please try again or contact support.'
            processing = false
          }
        },

        onError(err: Error) {
          console.error('[PayPal] Button error:', err)
          paypalError = 'PayPal error: ' + err.message
          processing = false
        },

        onCancel() {
          console.log('[PayPal] Payment cancelled')
          paypalError = 'Payment cancelled. You can try again anytime.'
          processing = false
        }
      })

      // Check if container exists before rendering
      if (!paypalContainerEl) {
        throw new Error('PayPal container element not found in DOM')
      }

      buttons.render(paypalContainerEl)
      console.log('[PayPal] Buttons rendered successfully')
      paypalLoaded = true

    } catch (err) {
      console.error('[PayPal] Setup error:', err)
      paypalError = err instanceof Error ? err.message : 'Failed to initialize PayPal'
      paypalLoaded = false
    }
  })
</script>

<svelte:head>
  <title>Checkout — ClawMaster</title>
</svelte:head>

<div class="min-h-screen bg-[#0d1117] flex items-center justify-center px-4 py-12">
  <div class="w-full max-w-lg">
    <!-- Header -->
    <div class="text-center mb-8">
      <a href="/" class="inline-flex items-center gap-2">
        <span class="text-2xl">🦞</span>
        <span class="text-xl font-bold text-white">Claw<span class="text-orange-500">Master</span></span>
      </a>
    </div>

    <!-- Order Summary -->
    <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6 mb-6">
      <h2 class="text-white font-bold text-lg mb-4">Order Summary</h2>
      <div class="flex items-center justify-between py-3 border-b border-slate-700">
        <div>
          <p class="text-white font-medium">ClawMaster Full Access</p>
          <p class="text-slate-400 text-sm">Lifetime license · All 15 modules · 1,000 credits</p>
        </div>
        <span class="text-white font-bold text-xl">$19</span>
      </div>
      <div class="flex items-center justify-between pt-3">
        <span class="text-slate-400">Total</span>
        <span class="text-orange-400 font-bold text-xl">$19.00 USD</span>
      </div>
    </div>

    <!-- What you get -->
    <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6 mb-6">
      <h3 class="text-white font-semibold mb-3">What's included:</h3>
      <ul class="space-y-2 text-sm text-slate-300">
        <li class="flex gap-2"><span class="text-orange-400">✓</span> All 15 learning modules (beginner → advanced)</li>
        <li class="flex gap-2"><span class="text-orange-400">✓</span> 1,000 ClawBot AI credits (~50,000 words of AI help)</li>
        <li class="flex gap-2"><span class="text-orange-400">✓</span> Visual config wizards for all channels</li>
        <li class="flex gap-2"><span class="text-orange-400">✓</span> Achievement system + XP tracking</li>
        <li class="flex gap-2"><span class="text-orange-400">✓</span> All future modules at no extra cost</li>
        <li class="flex gap-2"><span class="text-orange-400">✓</span> 30-day money-back guarantee</li>
      </ul>
    </div>

    <!-- PayPal Button Container -->
    <div class="bg-[#161b22] border border-slate-700 rounded-2xl p-6">
      <h3 class="text-white font-semibold mb-4 text-center">Complete Payment</h3>

      {#if paypalError}
        <div class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {paypalError}
          <button 
            on:click={() => { paypalError = ''; paypalLoaded = false; onMount() }}
            class="ml-2 underline hover:text-red-300"
          >
            Retry
          </button>
        </div>
      {/if}

      {#if processing}
        <div class="flex items-center justify-center gap-3 py-8 text-slate-300">
          <div class="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
          <span>Processing payment...</span>
        </div>
      {:else if !paypalLoaded}
        <div class="flex items-center justify-center py-8 text-slate-400">
          <div class="animate-spin w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full mr-3"></div>
          Loading PayPal...
        </div>
      {/if}

      <!-- Always visible container for PayPal to render into -->
      <div bind:this={paypalContainerEl} id="paypal-button-container" class="min-h-[150px]"></div>

      <p class="mt-4 text-center text-xs text-slate-500">
        🔒 Secured by PayPal · 30-day money-back guarantee
      </p>
    </div>

    <p class="mt-4 text-center text-sm text-slate-500">
      <a href="/" class="hover:text-slate-400 transition">← Back to home</a>
    </p>
  </div>
</div>
