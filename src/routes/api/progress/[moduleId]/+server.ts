import { json, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, request, locals }) => {
  const { session, user } = await locals.safeGetSession()
  if (!session || !user) {
    throw error(401, 'Unauthorized')
  }

  const { progress_pct, status } = await request.json()

  // Upsert progress
  const { error: dbError } = await locals.supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      module_id: params.moduleId,
      progress_pct: Math.min(100, Math.max(0, progress_pct || 0)),
      status: status || 'in_progress',
      completed_at: status === 'completed' ? new Date().toISOString() : null
    }, {
      onConflict: 'user_id,module_id'
    })

  if (dbError) {
    console.error('Progress save error:', dbError)
    throw error(500, 'Failed to save progress')
  }

  // If completed, award XP to user
  if (status === 'completed') {
    const { data: moduleData } = await locals.supabase
      .from('modules')
      .select('xp_reward')
      .eq('id', params.moduleId)
      .single()

    if (moduleData?.xp_reward) {
      const { data: profile } = await locals.supabase
        .from('user_profiles')
        .select('xp')
        .eq('id', user.id)
        .single()

      if (profile) {
        await locals.supabase
          .from('user_profiles')
          .update({ xp: (profile.xp || 0) + moduleData.xp_reward })
          .eq('id', user.id)
      }
    }
  }

  return json({ success: true })
}
