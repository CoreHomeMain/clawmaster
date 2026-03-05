import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

const PAYPAL_CLIENT_ID = import.meta.env.PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = import.meta.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET
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

export const POST: RequestHandler = async ({ locals }) => {
  const { session } = await locals.safeGetSession()
  if (!session) {
    throw error(401, 'Unauthorized')
  }

  try {
    const accessToken = await getPayPalAccessToken()

    const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: '19.00'
          },
          description: 'ClawMaster Full Access — Lifetime License'
        }],
        application_context: {
          brand_name: 'ClawMaster',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/checkout/success`,
          cancel_url: `${process.env.PUBLIC_APP_URL || 'http://localhost:5173'}/checkout`,
        }
      })
    })

    const order = await res.json()
    return json({ id: order.id, status: order.status })
  } catch (err) {
    console.error('PayPal create order error:', err)
    throw error(500, 'Failed to create order')
  }
}
