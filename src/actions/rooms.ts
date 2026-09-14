'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/db'
import type { Room, RoomCategory } from '@/types'

export async function getRooms(): Promise<Room[]> {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT r.*,
        CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END as category
      FROM rooms r
      LEFT JOIN room_categories rc ON r.category_id = rc.id
      ORDER BY r.sort_order ASC
    `
    return rows as Room[]
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return []
  }
}

export async function getRoomById(id: string): Promise<Room | null> {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT r.*,
        CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END as category
      FROM rooms r
      LEFT JOIN room_categories rc ON r.category_id = rc.id
      WHERE r.id = ${id}
    `
    return (rows[0] as Room) ?? null
  } catch (error) {
    console.error('Error fetching room:', error)
    return null
  }
}

export async function getRoomCategories(): Promise<RoomCategory[]> {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT * FROM room_categories ORDER BY sort_order ASC
    `
    return rows as RoomCategory[]
  } catch (error) {
    console.error('Error fetching room categories:', error)
    return []
  }
}

export async function updateRoomStatus(id: string, status: string) {
  const sql = getDb()

  try {
    await sql`UPDATE rooms SET status = ${status} WHERE id = ${id}`
  } catch (error) {
    console.error('Error updating room status:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/cabanas')
  revalidatePath(`/cabanas/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateCleaningStatus(id: string, status: string) {
  const sql = getDb()

  try {
    await sql`UPDATE rooms SET cleaning_status = ${status} WHERE id = ${id}`
  } catch (error) {
    console.error('Error updating cleaning status:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/cabanas')
  revalidatePath(`/cabanas/${id}`)
  revalidatePath('/cabanas/limpieza')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateRoomNotes(id: string, notes: string) {
  const sql = getDb()

  try {
    await sql`UPDATE rooms SET notes = ${notes} WHERE id = ${id}`
  } catch (error) {
    console.error('Error updating room notes:', error)
    return { error: (error as Error).message }
  }

  revalidatePath(`/cabanas/${id}`)
  return { success: true }
}

export async function getRoomReservations(roomId: string) {
  const sql = getDb()
  const today = new Date().toISOString().split('T')[0]

  try {
    const rows = await sql`
      SELECT res.*,
        CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest
      FROM reservations res
      LEFT JOIN guests g ON res.guest_id = g.id
      WHERE res.room_id = ${roomId}
        AND res.check_out_date >= ${today}
        AND res.status IN ('pending', 'confirmed', 'checked_in')
      ORDER BY res.check_in_date ASC
      LIMIT 10
    `
    return rows
  } catch (error) {
    console.error('Error fetching room reservations:', error)
    return []
  }
}
