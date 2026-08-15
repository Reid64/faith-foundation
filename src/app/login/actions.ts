'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Sign in with email + password.
 *
 * On failure this redirects back to /login carrying an error code (and the
 * submitted email, so the field can be repopulated) rather than returning a
 * value — that keeps the login page a pure server component with no client
 * JavaScript, which is all an internal tool needs.
 *
 * `redirect()` works by throwing a NEXT_REDIRECT control-flow error, so it must
 * never be called inside a try/catch that would swallow it.
 */
export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    redirect(`/login?error=missing&email=${encodeURIComponent(email)}`)
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Deliberately generic: distinguishing "no such user" from "wrong password"
    // would tell an attacker which addresses have accounts.
    redirect(`/login?error=invalid&email=${encodeURIComponent(email)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

/** Sign out and return to the login screen. */
export async function signOut() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
