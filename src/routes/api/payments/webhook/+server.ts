import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json()
  
  console.log('PayPal webhook received:', body.event_type)

  // Handle webhook events
  switch (body.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      // Payment completed - credits already added in capture endpoint
      console.log('Payment capture completed via webhook:', body.resource?.id)
      break
    case 'PAYMENT.CAPTURE.DENIED':
      console.log('Payment denied:', body.resource?.id)
      break
    default:
      console.log('Unhandled webhook event:', body.event_type)
  }

  return json({ received: true })
}
