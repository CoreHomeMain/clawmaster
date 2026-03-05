import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!email || !password) {
      return fail(400, { error: 'Email and password are required', email })
    }

    if (password !== confirmPassword) {
      return fail(400, { error: 'Passwords do not match', email })
    }

    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters', email })
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`
      }
    })

    if (error) {
      return fail(400, { error: error.message, email })
    }

    redirect(303, '/onboarding')
  }
}
