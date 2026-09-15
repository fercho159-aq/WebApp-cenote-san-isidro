'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import type { Supplier } from '@/types'

export async function getSuppliers(search?: string) {
  const sql = getDb()

  try {
    if (search) {
      const term = `%${search}%`
      const rows = await sql`
        SELECT * FROM suppliers
        WHERE name ILIKE ${term}
          OR contact_name ILIKE ${term}
          OR email ILIKE ${term}
          OR phone ILIKE ${term}
          OR rfc ILIKE ${term}
        ORDER BY name ASC
      `
      return rows as Supplier[]
    }

    const rows = await sql`
      SELECT * FROM suppliers ORDER BY name ASC
    `
    return rows as Supplier[]
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }
}

export async function getSupplierById(id: string) {
  const sql = getDb()

  try {
    const rows = await sql`SELECT * FROM suppliers WHERE id = ${id}`
    return (rows[0] as Supplier) ?? null
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return null
  }
}

export async function createSupplier(formData: FormData) {
  const sql = getDb()

  const name = formData.get('name') as string
  const contactName = (formData.get('contact_name') as string) || null
  const phone = (formData.get('phone') as string) || null
  const email = (formData.get('email') as string) || null
  const rfc = (formData.get('rfc') as string) || null
  const address = (formData.get('address') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!name) {
    return { error: 'El nombre del proveedor es obligatorio.' }
  }

  try {
    await sql`
      INSERT INTO suppliers (name, contact_name, phone, email, rfc, address, notes)
      VALUES (${name}, ${contactName}, ${phone}, ${email}, ${rfc}, ${address}, ${notes})
    `
  } catch (error) {
    console.error('Error creating supplier:', error)
    return { error: 'Error al crear el proveedor. Intente de nuevo.' }
  }

  revalidatePath('/proveedores')
  redirect('/proveedores')
}

export async function updateSupplier(id: string, formData: FormData) {
  const sql = getDb()

  const name = formData.get('name') as string
  const contactName = (formData.get('contact_name') as string) || null
  const phone = (formData.get('phone') as string) || null
  const email = (formData.get('email') as string) || null
  const rfc = (formData.get('rfc') as string) || null
  const address = (formData.get('address') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!name) {
    return { error: 'El nombre del proveedor es obligatorio.' }
  }

  try {
    await sql`
      UPDATE suppliers SET
        name = ${name},
        contact_name = ${contactName},
        phone = ${phone},
        email = ${email},
        rfc = ${rfc},
        address = ${address},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating supplier:', error)
    return { error: 'Error al actualizar el proveedor. Intente de nuevo.' }
  }

  revalidatePath('/proveedores')
  redirect('/proveedores')
}

export async function deleteSupplier(id: string) {
  const sql = getDb()

  try {
    // Check if supplier has expenses
    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM expenses WHERE supplier_id = ${id}
    `

    if (countResult[0].count > 0) {
      return { error: 'No se puede eliminar un proveedor que tiene gastos asociados.' }
    }

    await sql`DELETE FROM suppliers WHERE id = ${id}`
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return { error: 'Error al eliminar el proveedor.' }
  }

  revalidatePath('/proveedores')
  redirect('/proveedores')
}
