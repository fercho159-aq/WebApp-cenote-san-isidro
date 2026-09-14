'use server'

import { redirect } from 'next/navigation'
import { authenticate, logout } from '@/lib/auth'

export async function signIn(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' }
  }

  const result = await authenticate(email, password)

  if (result.error) {
    return { error: result.error }
  }

  redirect('/dashboard')
}

export async function signOut() {
  await logout()
  redirect('/login')
}
