import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getDb } from './db'
import bcrypt from 'bcryptjs'

export interface SessionData {
  userId: string
  email: string
  fullName: string
  role: 'admin' | 'employee'
  isLoggedIn: boolean
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'cenote-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.userId) return null
  return {
    id: session.userId,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
  }
}

export async function authenticate(email: string, password: string) {
  const sql = getDb()
  const rows = await sql`
    SELECT id, email, password_hash, full_name, role, is_active
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `
  if (rows.length === 0) return { error: 'Credenciales incorrectas' }

  const user = rows[0]
  if (!user.is_active) return { error: 'Cuenta desactivada' }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return { error: 'Credenciales incorrectas' }

  const session = await getSession()
  session.userId = user.id
  session.email = user.email
  session.fullName = user.full_name
  session.role = user.role as 'admin' | 'employee'
  session.isLoggedIn = true
  await session.save()

  return { success: true }
}

export async function logout() {
  const session = await getSession()
  session.destroy()
}
