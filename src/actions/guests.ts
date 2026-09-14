'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import type { Guest, Reservation } from '@/types'

export async function getGuests(search?: string) {
  const sql = getDb()

  try {
    if (search) {
      const term = `%${search}%`
      const rows = await sql`
        SELECT * FROM guests
        WHERE first_name ILIKE ${term}
          OR last_name ILIKE ${term}
          OR email ILIKE ${term}
          OR phone ILIKE ${term}
        ORDER BY last_name ASC, first_name ASC
      `
      return rows as Guest[]
    }

    const rows = await sql`
      SELECT * FROM guests ORDER BY last_name ASC, first_name ASC
    `
    return rows as Guest[]
  } catch (error) {
    console.error('Error fetching guests:', error)
    return []
  }
}

export async function getGuestById(id: string) {
  const sql = getDb()

  try {
    const guestRows = await sql`SELECT * FROM guests WHERE id = ${id}`
    const guest = guestRows[0]

    if (!guest) return null

    const reservations = await sql`
      SELECT res.*,
        CASE WHEN rm.id IS NOT NULL THEN json_build_object('name', rm.name) ELSE NULL END as room
      FROM reservations res
      LEFT JOIN rooms rm ON res.room_id = rm.id
      WHERE res.guest_id = ${id}
      ORDER BY res.check_in_date DESC
    `

    return {
      guest: guest as Guest,
      reservations: reservations as (Reservation & { room: { name: string } })[],
    }
  } catch (error) {
    console.error('Error fetching guest:', error)
    return null
  }
}

export async function createGuest(formData: FormData) {
  const sql = getDb()

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const idDocumentType = (formData.get('id_document_type') as string) || null
  const idDocumentNumber = (formData.get('id_document_number') as string) || null
  const nationality = (formData.get('nationality') as string) || null
  const country = (formData.get('country') as string) || null
  const state = (formData.get('state') as string) || null
  const city = (formData.get('city') as string) || null
  const address = (formData.get('address') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!firstName || !lastName) {
    return { error: 'El nombre y apellido son obligatorios.' }
  }

  try {
    await sql`
      INSERT INTO guests (
        first_name, last_name, email, phone, id_document_type,
        id_document_number, nationality, country, state, city,
        address, notes
      ) VALUES (
        ${firstName}, ${lastName}, ${email}, ${phone}, ${idDocumentType},
        ${idDocumentNumber}, ${nationality}, ${country}, ${state}, ${city},
        ${address}, ${notes}
      )
    `
  } catch (error) {
    console.error('Error creating guest:', error)
    return { error: 'Error al crear el huésped. Intente de nuevo.' }
  }

  revalidatePath('/huespedes')
  redirect('/huespedes')
}

export async function updateGuest(id: string, formData: FormData) {
  const sql = getDb()

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const email = (formData.get('email') as string) || null
  const phone = (formData.get('phone') as string) || null
  const idDocumentType = (formData.get('id_document_type') as string) || null
  const idDocumentNumber = (formData.get('id_document_number') as string) || null
  const nationality = (formData.get('nationality') as string) || null
  const country = (formData.get('country') as string) || null
  const state = (formData.get('state') as string) || null
  const city = (formData.get('city') as string) || null
  const address = (formData.get('address') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!firstName || !lastName) {
    return { error: 'El nombre y apellido son obligatorios.' }
  }

  try {
    await sql`
      UPDATE guests SET
        first_name = ${firstName},
        last_name = ${lastName},
        email = ${email},
        phone = ${phone},
        id_document_type = ${idDocumentType},
        id_document_number = ${idDocumentNumber},
        nationality = ${nationality},
        country = ${country},
        state = ${state},
        city = ${city},
        address = ${address},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating guest:', error)
    return { error: 'Error al actualizar el huésped. Intente de nuevo.' }
  }

  revalidatePath('/huespedes')
  revalidatePath(`/huespedes/${id}`)
  redirect(`/huespedes/${id}`)
}

export async function deleteGuest(id: string) {
  const sql = getDb()

  try {
    // Check if guest has reservations
    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM reservations WHERE guest_id = ${id}
    `

    if (countResult[0].count > 0) {
      return { error: 'No se puede eliminar un huésped que tiene reservaciones.' }
    }

    await sql`DELETE FROM guests WHERE id = ${id}`
  } catch (error) {
    console.error('Error deleting guest:', error)
    return { error: 'Error al eliminar el huésped.' }
  }

  revalidatePath('/huespedes')
  redirect('/huespedes')
}
