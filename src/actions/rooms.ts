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

// ---- Room CRUD ----

export async function getRoomCategoryById(id: string): Promise<RoomCategory | null> {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT * FROM room_categories WHERE id = ${id}
    `
    return (rows[0] as RoomCategory) ?? null
  } catch (error) {
    console.error('Error fetching room category:', error)
    return null
  }
}

export async function createRoom(data: {
  name: string
  categoryId: string
  floor?: string
  notes?: string
  sortOrder?: number
}) {
  const sql = getDb()

  try {
    await sql`
      INSERT INTO rooms (name, category_id, floor, notes, sort_order)
      VALUES (
        ${data.name},
        ${data.categoryId},
        ${data.floor ?? null},
        ${data.notes ?? null},
        ${data.sortOrder ?? 0}
      )
    `
  } catch (error) {
    console.error('Error creating room:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/cabanas')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateRoom(
  id: string,
  data: {
    name: string
    categoryId: string
    floor?: string
    notes?: string
    sortOrder?: number
  }
) {
  const sql = getDb()

  try {
    await sql`
      UPDATE rooms
      SET name = ${data.name},
          category_id = ${data.categoryId},
          floor = ${data.floor ?? null},
          notes = ${data.notes ?? null},
          sort_order = ${data.sortOrder ?? 0},
          updated_at = now()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating room:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/cabanas')
  revalidatePath(`/cabanas/${id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteRoom(id: string) {
  const sql = getDb()

  try {
    // Check for active reservations
    const activeReservations = await sql`
      SELECT COUNT(*) as count
      FROM reservations
      WHERE room_id = ${id}
        AND status IN ('pending', 'confirmed', 'checked_in')
    `
    if (Number(activeReservations[0].count) > 0) {
      return { error: 'No se puede eliminar la cabana porque tiene reservaciones activas.' }
    }

    await sql`DELETE FROM rooms WHERE id = ${id}`
  } catch (error) {
    console.error('Error deleting room:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/cabanas')
  revalidatePath('/dashboard')
  return { success: true }
}

// ---- Room Category CRUD ----

export async function createRoomCategory(data: {
  name: string
  description?: string
  basePrice: number
  maxAdults: number
  maxChildren: number
  amenities?: string[]
  sortOrder?: number
}) {
  const sql = getDb()

  try {
    await sql`
      INSERT INTO room_categories (name, description, base_price, max_adults, max_children, amenities, sort_order)
      VALUES (
        ${data.name},
        ${data.description ?? null},
        ${data.basePrice},
        ${data.maxAdults},
        ${data.maxChildren},
        ${JSON.stringify(data.amenities ?? [])},
        ${data.sortOrder ?? 0}
      )
    `
  } catch (error) {
    console.error('Error creating room category:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/cabanas')
  revalidatePath('/cabanas/categorias')
  return { success: true }
}

export async function updateRoomCategory(
  id: string,
  data: {
    name: string
    description?: string
    basePrice: number
    maxAdults: number
    maxChildren: number
    amenities?: string[]
    sortOrder?: number
  }
) {
  const sql = getDb()

  try {
    await sql`
      UPDATE room_categories
      SET name = ${data.name},
          description = ${data.description ?? null},
          base_price = ${data.basePrice},
          max_adults = ${data.maxAdults},
          max_children = ${data.maxChildren},
          amenities = ${JSON.stringify(data.amenities ?? [])},
          sort_order = ${data.sortOrder ?? 0},
          updated_at = now()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating room category:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/cabanas')
  revalidatePath('/cabanas/categorias')
  return { success: true }
}

export async function deleteRoomCategory(id: string) {
  const sql = getDb()

  try {
    // Check if any rooms use this category
    const roomsUsingCategory = await sql`
      SELECT COUNT(*) as count
      FROM rooms
      WHERE category_id = ${id}
    `
    if (Number(roomsUsingCategory[0].count) > 0) {
      return { error: 'No se puede eliminar la categoria porque tiene cabanas asignadas.' }
    }

    await sql`DELETE FROM room_categories WHERE id = ${id}`
  } catch (error) {
    console.error('Error deleting room category:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/cabanas')
  revalidatePath('/cabanas/categorias')
  return { success: true }
}
