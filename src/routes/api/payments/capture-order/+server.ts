import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  })
  const data = await res.json()
  return data.access_token
}

export const POST: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession()
  if (!session || !user) {
    throw error(401, 'Unauthorized')
  }

  const { orderId } = await request.json()
  if (!orderId) {
    throw error(400, 'Missing orderId')
  }

  try {
    const accessToken = await getPayPalAccessToken()

    // Capture the order
    const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    })

    const captureData = await res.json()

    if (captureData.status !== 'COMPLETED') {
      throw error(400, `Payment not completed: ${captureData.status}`)
    }

    const purchaseUnit = captureData.purchase_units?.[0]
    const capture = purchaseUnit?.payments?.captures?.[0]
    const amount = parseFloat(capture?.amount?.value || '19')

    // Add credits to user_profiles using service role
    const { createClient } = await import('@supabase/supabase-js')
    const adminSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Add 1000 credits
    const { error: profileError } = await adminSupabase
      .from('user_profiles')
      .update({ credits: adminSupabase.rpc('increment_credits', { user_id: user.id, amount: 1000 }) as any })
      .eq('id', user.id)

    // Simpler approach - just increment directly
    await adminSupabase.rpc('increment_user_credits', { p_user_id: user.id, p_amount: 1000 })
      .then(() => {})
      .catch(async () => {
        // Fallback: get current credits and add 1000
        const { data: profile } = await adminSupabase
          .from('user_profiles')
          .select('credits')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          await adminSupabase
            .from('user_profiles')
            .update({ credits: (profile.credits || 0) + 1000 })
            .eq('id', user.id)
        }
      })

    // Create purchase record
    await adminSupabase.from('purchases').insert({
      user_id: user.id,
      amount_usd: amount,
      credits_added: 1000,
      paypal_order_id: orderId,
      status: 'completed'
    })

    return json({ success: true, orderId, creditsAdded: 1000 })
  } catch (err) {
    console.error('PayPal capture error:', err)
    if (err && typeof err === 'object' && 'status' in err) throw err
    throw error(500, 'Failed to capture payment')
  }
}
