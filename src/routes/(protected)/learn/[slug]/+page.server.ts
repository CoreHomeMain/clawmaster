import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const { user } = await locals.safeGetSession()

  const { data: module, error: moduleError } = await locals.supabase
    .from('modules')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (moduleError || !module) {
    throw error(404, 'Module not found')
  }

  // Get adjacent modules
  const { data: allModules } = await locals.supabase
    .from('modules')
    .select('id, slug, title, level, order_index')
    .order('order_index', { ascending: true })

  const currentIndex = allModules?.findIndex(m => m.id === module.id) ?? -1
  const prevModule = currentIndex > 0 ? allModules?.[currentIndex - 1] : null
  const nextModule = allModules && currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null

  // Get user progress for this module
  let userProgress = null
  if (user) {
    const { data } = await locals.supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', module.id)
      .single()
    userProgress = data
  }

  return { module, prevModule, nextModule, userProgress }
}
