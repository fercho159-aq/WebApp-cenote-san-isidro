'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

// ---- Users ----

export async function getUsers() {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      ORDER BY full_name ASC
    `
    return rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      email: row.email as string,
      fullName: row.full_name as string,
      role: row.role as string,
      isActive: row.is_active as boolean,
      createdAt: row.created_at as string,
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function getUserById(id: string) {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE id = ${id}
    `
    if (rows.length === 0) return null

    const row = rows[0]
    return {
      id: row.id as string,
      email: row.email as string,
      fullName: row.full_name as string,
      role: row.role as string,
      isActive: row.is_active as boolean,
      createdAt: row.created_at as string,
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function createUser(data: {
  email: string
  password: string
  fullName: string
  role: string
}) {
  const sql = getDb()

  if (!data.email || !data.password || !data.fullName) {
    return { error: 'Email, nombre completo y contraseña son obligatorios.' }
  }

  if (data.password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  try {
    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${data.email}`
    if (existing.length > 0) {
      return { error: 'Ya existe un usuario con ese email.' }
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    await sql`
      INSERT INTO users (email, password_hash, full_name, role, is_active)
      VALUES (${data.email}, ${passwordHash}, ${data.fullName}, ${data.role}, true)
    `
  } catch (error) {
    console.error('Error creating user:', error)
    return { error: 'Error al crear el usuario. Intente de nuevo.' }
  }

  revalidatePath('/configuracion')
  redirect('/configuracion')
}

export async function updateUser(
  id: string,
  data: {
    fullName?: string
    role?: string
    isActive?: boolean
  }
) {
  const sql = getDb()

  try {
    if (data.fullName !== undefined) {
      await sql`UPDATE users SET full_name = ${data.fullName} WHERE id = ${id}`
    }
    if (data.role !== undefined) {
      await sql`UPDATE users SET role = ${data.role} WHERE id = ${id}`
    }
    if (data.isActive !== undefined) {
      await sql`UPDATE users SET is_active = ${data.isActive} WHERE id = ${id}`
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return { error: 'Error al actualizar el usuario.' }
  }

  revalidatePath('/configuracion')
  return { success: true }
}

export async function resetUserPassword(id: string, newPassword: string) {
  const sql = getDb()

  if (!newPassword || newPassword.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${id}`
  } catch (error) {
    console.error('Error resetting password:', error)
    return { error: 'Error al cambiar la contraseña.' }
  }

  return { success: true }
}

// ---- Property Settings ----

export async function getPropertySettings() {
  // Hardcoded for now - can be moved to a settings table later
  return {
    name: 'Cenote San Isidro',
    address: 'Carretera Mérida - Cancún Km 50, Yucatán, México',
    phone: '+52 999 123 4567',
    email: 'reservaciones@cenotesanisidro.com',
    website: 'https://cenotesanisidro.com',
    checkInTime: '15:00',
    checkOutTime: '12:00',
    taxRate: 16,
    currency: 'MXN',
  }
}
