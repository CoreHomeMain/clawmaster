import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, url }) => {
  const { session, user } = await safeGetSession()

  if (!session) {
    redirect(303, `/login?redirectTo=${url.pathname}`)
  }

  return { session, user }
}
