'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { TAX_RATE } from '@/lib/constants'
import type { Reservation, Room } from '@/types'

// ---- Queries ----

export async function getReservations(filters?: {
  status?: string
  search?: string
  startDate?: string
  endDate?: string
}) {
  const sql = getDb()

  const statusFilter =
    filters?.status && filters.status !== 'all' ? filters.status : null
  const searchPattern = filters?.search ? `%${filters.search}%` : null
  const startDate = filters?.startDate || null
  const endDate = filters?.endDate || null

  try {
    const rows = await sql`
      SELECT res.*,
        CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
        CASE WHEN rm.id IS NOT NULL THEN
          json_build_object(
            'id', rm.id, 'name', rm.name, 'category_id', rm.category_id,
            'status', rm.status, 'cleaning_status', rm.cleaning_status,
            'notes', rm.notes, 'sort_order', rm.sort_order,
            'category', CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END
          )
        ELSE NULL END as room
      FROM reservations res
      LEFT JOIN guests g ON res.guest_id = g.id
      LEFT JOIN rooms rm ON res.room_id = rm.id
      LEFT JOIN room_categories rc ON rm.category_id = rc.id
      WHERE (${statusFilter} IS NULL OR res.status = ${statusFilter})
        AND (${searchPattern} IS NULL OR res.reservation_number ILIKE ${searchPattern} OR g.first_name ILIKE ${searchPattern} OR g.last_name ILIKE ${searchPattern})
        AND (${startDate} IS NULL OR res.check_in_date >= ${startDate})
        AND (${endDate} IS NULL OR res.check_out_date <= ${endDate})
      ORDER BY res.check_in_date DESC
    `
    return rows as Reservation[]
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return []
  }
}

export async function getReservationById(id: string) {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT res.*,
        CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
        CASE WHEN rm.id IS NOT NULL THEN
          json_build_object(
            'id', rm.id, 'name', rm.name, 'category_id', rm.category_id,
            'status', rm.status, 'cleaning_status', rm.cleaning_status,
            'notes', rm.notes, 'sort_order', rm.sort_order,
            'category', CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END
          )
        ELSE NULL END as room
      FROM reservations res
      LEFT JOIN guests g ON res.guest_id = g.id
      LEFT JOIN rooms rm ON res.room_id = rm.id
      LEFT JOIN room_categories rc ON rm.category_id = rc.id
      WHERE res.id = ${id}
    `
    return (rows[0] as Reservation) ?? null
  } catch (error) {
    console.error('Error fetching reservation:', error)
    return null
  }
}

export async function getArrivals(date?: string) {
  const sql = getDb()
  const targetDate = date || new Date().toISOString().split('T')[0]

  try {
    const rows = await sql`
      SELECT res.*,
        CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
        CASE WHEN rm.id IS NOT NULL THEN
          json_build_object(
            'id', rm.id, 'name', rm.name, 'category_id', rm.category_id,
            'status', rm.status, 'cleaning_status', rm.cleaning_status,
            'notes', rm.notes, 'sort_order', rm.sort_order,
            'category', CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END
          )
        ELSE NULL END as room
      FROM reservations res
      LEFT JOIN guests g ON res.guest_id = g.id
      LEFT JOIN rooms rm ON res.room_id = rm.id
      LEFT JOIN room_categories rc ON rm.category_id = rc.id
      WHERE res.check_in_date = ${targetDate}
        AND res.status IN ('pending', 'confirmed')
      ORDER BY res.created_at ASC
    `
    return rows as Reservation[]
  } catch (error) {
    console.error('Error fetching arrivals:', error)
    return []
  }
}

export async function getDepartures(date?: string) {
  const sql = getDb()
  const targetDate = date || new Date().toISOString().split('T')[0]

  try {
    const rows = await sql`
      SELECT res.*,
        CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
        CASE WHEN rm.id IS NOT NULL THEN
          json_build_object(
            'id', rm.id, 'name', rm.name, 'category_id', rm.category_id,
            'status', rm.status, 'cleaning_status', rm.cleaning_status,
            'notes', rm.notes, 'sort_order', rm.sort_order,
            'category', CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END
          )
        ELSE NULL END as room
      FROM reservations res
      LEFT JOIN guests g ON res.guest_id = g.id
      LEFT JOIN rooms rm ON res.room_id = rm.id
      LEFT JOIN room_categories rc ON rm.category_id = rc.id
      WHERE res.check_out_date = ${targetDate}
        AND res.status = 'checked_in'
      ORDER BY res.created_at ASC
    `
    return rows as Reservation[]
  } catch (error) {
    console.error('Error fetching departures:', error)
    return []
  }
}

export async function getCalendarData(startDate: string, endDate: string) {
  const sql = getDb()

  try {
    const [rooms, reservations] = await Promise.all([
      sql`
        SELECT r.*,
          CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END as category
        FROM rooms r
        LEFT JOIN room_categories rc ON r.category_id = rc.id
        ORDER BY r.sort_order ASC
      `,
      sql`
        SELECT res.*,
          CASE WHEN g.id IS NOT NULL
            THEN json_build_object('first_name', g.first_name, 'last_name', g.last_name)
            ELSE NULL END as guest,
          CASE WHEN rm.id IS NOT NULL
            THEN json_build_object('name', rm.name)
            ELSE NULL END as room
        FROM reservations res
        LEFT JOIN guests g ON res.guest_id = g.id
        LEFT JOIN rooms rm ON res.room_id = rm.id
        WHERE res.status IN ('pending', 'confirmed', 'checked_in')
          AND res.check_in_date <= ${endDate}
          AND res.check_out_date >= ${startDate}
      `,
    ])

    return {
      rooms: rooms as Room[],
      reservations: reservations as Reservation[],
    }
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return {
      rooms: [] as Room[],
      reservations: [] as Reservation[],
    }
  }
}

export async function getAvailableRooms(checkIn: string, checkOut: string) {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT r.*,
        CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END as category
      FROM rooms r
      LEFT JOIN room_categories rc ON r.category_id = rc.id
      WHERE r.status IN ('available', 'occupied')
        AND NOT EXISTS (
          SELECT 1 FROM reservations res
          WHERE res.room_id = r.id
            AND res.status IN ('pending', 'confirmed', 'checked_in')
            AND res.check_in_date < ${checkOut}
            AND res.check_out_date > ${checkIn}
        )
      ORDER BY r.sort_order ASC
    `
    return rows as Room[]
  } catch (error) {
    console.error('Error fetching available rooms:', error)
    return []
  }
}

// ---- Mutations ----

export async function createReservation(formData: FormData) {
  const sql = getDb()

  const checkInDate = formData.get('check_in_date') as string
  const checkOutDate = formData.get('check_out_date') as string
  const roomId = formData.get('room_id') as string
  const guestId = formData.get('guest_id') as string
  const adults = parseInt(formData.get('adults') as string) || 1
  const children = parseInt(formData.get('children') as string) || 0
  const bookingChannel = (formData.get('booking_channel') as string) || 'direct'
  const channelReference =
    (formData.get('channel_reference') as string) || null
  const nightlyRate = parseFloat(formData.get('nightly_rate') as string) || 0
  const discountType =
    (formData.get('discount_type') as string) || null
  const discountValue =
    parseFloat(formData.get('discount_value') as string) || 0
  const notes = (formData.get('notes') as string) || null
  const internalNotes = (formData.get('internal_notes') as string) || null

  // Validate required fields
  if (!checkInDate || !checkOutDate || !roomId || !guestId) {
    return {
      error:
        'Faltan datos obligatorios: fechas, cabaña y huésped son requeridos.',
    }
  }

  // Calculate nights
  const checkIn = new Date(checkInDate)
  const checkOut = new Date(checkOutDate)
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (nights <= 0) {
    return { error: 'La fecha de check-out debe ser posterior al check-in.' }
  }

  // Calculate tariff
  let subtotal = nightlyRate * nights

  if (discountType === 'percentage' && discountValue > 0) {
    subtotal = subtotal - subtotal * (discountValue / 100)
  } else if (discountType === 'fixed' && discountValue > 0) {
    subtotal = subtotal - discountValue
  }

  if (subtotal < 0) subtotal = 0

  const taxAmount = subtotal * TAX_RATE
  const total = subtotal + taxAmount

  // Generate reservation number
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  const reservationNumber = `RSV-${year}${month}-${random}`

  const finalDiscountType = discountType === 'none' ? null : discountType
  const finalDiscountValue = discountValue || null

  let data: { id: string }

  try {
    const rows = await sql`
      INSERT INTO reservations (
        reservation_number, guest_id, room_id, check_in_date, check_out_date,
        nights, adults, children, status, payment_status, booking_channel,
        channel_reference, nightly_rate, discount_type, discount_value,
        subtotal, tax_rate, tax_amount, total, amount_paid, balance_due,
        notes, internal_notes
      ) VALUES (
        ${reservationNumber}, ${guestId}, ${roomId}, ${checkInDate}, ${checkOutDate},
        ${nights}, ${adults}, ${children}, 'pending', 'unpaid', ${bookingChannel},
        ${channelReference}, ${nightlyRate}, ${finalDiscountType}, ${finalDiscountValue},
        ${subtotal}, ${TAX_RATE}, ${taxAmount}, ${total}, ${0}, ${total},
        ${notes}, ${internalNotes}
      ) RETURNING id
    `
    data = rows[0] as { id: string }
  } catch (error) {
    console.error('Error creating reservation:', error)
    return { error: 'Error al crear la reservación. Intente de nuevo.' }
  }

  revalidatePath('/reservaciones')
  revalidatePath('/reservaciones/calendario')
  revalidatePath('/reservaciones/llegadas')
  revalidatePath('/dashboard')
  redirect(`/reservaciones/${data.id}`)
}

export async function updateReservationStatus(id: string, status: string) {
  const sql = getDb()

  try {
    // Update reservation status with conditional timestamp fields
    const rows = await sql`
      UPDATE reservations SET
        status = ${status},
        actual_check_in = CASE WHEN ${status} = 'checked_in' THEN NOW() ELSE actual_check_in END,
        actual_check_out = CASE WHEN ${status} = 'checked_out' THEN NOW() ELSE actual_check_out END,
        cancelled_at = CASE WHEN ${status} = 'cancelled' THEN NOW() ELSE cancelled_at END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING room_id
    `

    const roomId = rows[0]?.room_id

    // On check-out, update room status to available and mark dirty
    if (status === 'checked_out' && roomId) {
      await sql`UPDATE rooms SET status = 'available', cleaning_status = 'dirty' WHERE id = ${roomId}`
    }

    // On check-in, update room status to occupied
    if (status === 'checked_in' && roomId) {
      await sql`UPDATE rooms SET status = 'occupied' WHERE id = ${roomId}`
    }
  } catch (error) {
    console.error('Error updating reservation status:', error)
    return { error: 'Error al actualizar el estado.' }
  }

  revalidatePath('/reservaciones')
  revalidatePath(`/reservaciones/${id}`)
  revalidatePath('/reservaciones/calendario')
  revalidatePath('/reservaciones/llegadas')
  revalidatePath('/reservaciones/salidas')
  revalidatePath('/cabanas')
  revalidatePath('/dashboard')

  return { success: true }
}
