'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TAX_RATE } from '@/lib/constants'
import type { Reservation, Room } from '@/types'

// ---- Queries ----

export async function getReservations(filters?: {
  status?: string
  search?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('reservations')
    .select('*, guest:guests(*), room:rooms(*, category:room_categories(*))')
    .order('check_in_date', { ascending: false })

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    const term = `%${filters.search}%`
    query = query.or(
      `reservation_number.ilike.${term},guest.first_name.ilike.${term},guest.last_name.ilike.${term}`
    )
  }

  if (filters?.startDate) {
    query = query.gte('check_in_date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('check_out_date', filters.endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reservations:', error)
    return []
  }

  return data as Reservation[]
}

export async function getReservationById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reservations')
    .select('*, guest:guests(*), room:rooms(*, category:room_categories(*))')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching reservation:', error)
    return null
  }

  return data as Reservation
}

export async function getArrivals(date?: string) {
  const supabase = await createClient()
  const targetDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('reservations')
    .select('*, guest:guests(*), room:rooms(*, category:room_categories(*))')
    .eq('check_in_date', targetDate)
    .in('status', ['pending', 'confirmed'])
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching arrivals:', error)
    return []
  }

  return data as Reservation[]
}

export async function getDepartures(date?: string) {
  const supabase = await createClient()
  const targetDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('reservations')
    .select('*, guest:guests(*), room:rooms(*, category:room_categories(*))')
    .eq('check_out_date', targetDate)
    .eq('status', 'checked_in')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching departures:', error)
    return []
  }

  return data as Reservation[]
}

export async function getCalendarData(startDate: string, endDate: string) {
  const supabase = await createClient()

  const [roomsResult, reservationsResult] = await Promise.all([
    supabase
      .from('rooms')
      .select('*, category:room_categories(*)')
      .order('sort_order', { ascending: true }),
    supabase
      .from('reservations')
      .select('*, guest:guests(first_name, last_name), room:rooms(name)')
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .lte('check_in_date', endDate)
      .gte('check_out_date', startDate),
  ])

  if (roomsResult.error) {
    console.error('Error fetching rooms for calendar:', roomsResult.error)
  }
  if (reservationsResult.error) {
    console.error(
      'Error fetching reservations for calendar:',
      reservationsResult.error
    )
  }

  return {
    rooms: (roomsResult.data ?? []) as Room[],
    reservations: (reservationsResult.data ?? []) as Reservation[],
  }
}

export async function getAvailableRooms(checkIn: string, checkOut: string) {
  const supabase = await createClient()

  // Get all rooms
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*, category:room_categories(*)')
    .in('status', ['available', 'occupied'])
    .order('sort_order', { ascending: true })

  if (roomsError) {
    console.error('Error fetching rooms:', roomsError)
    return []
  }

  // Get reservations that overlap with the desired dates
  const { data: overlapping, error: overlapError } = await supabase
    .from('reservations')
    .select('room_id')
    .in('status', ['pending', 'confirmed', 'checked_in'])
    .lt('check_in_date', checkOut)
    .gt('check_out_date', checkIn)

  if (overlapError) {
    console.error('Error checking availability:', overlapError)
    return rooms as Room[]
  }

  const occupiedRoomIds = new Set(
    (overlapping ?? []).map((r: { room_id: string }) => r.room_id)
  )

  return (rooms ?? []).filter(
    (room: Room) => !occupiedRoomIds.has(room.id)
  ) as Room[]
}

// ---- Mutations ----

export async function createReservation(formData: FormData) {
  const supabase = await createClient()

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

  const reservationData = {
    reservation_number: reservationNumber,
    guest_id: guestId,
    room_id: roomId,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    nights,
    adults,
    children,
    status: 'pending',
    payment_status: 'unpaid',
    booking_channel: bookingChannel,
    channel_reference: channelReference,
    nightly_rate: nightlyRate,
    discount_type: discountType === 'none' ? null : discountType,
    discount_value: discountValue || null,
    subtotal,
    tax_rate: TAX_RATE,
    tax_amount: taxAmount,
    total,
    amount_paid: 0,
    balance_due: total,
    notes,
    internal_notes: internalNotes,
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert(reservationData)
    .select()
    .single()

  if (error) {
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
  const supabase = await createClient()

  const updateData: Record<string, unknown> = { status }

  if (status === 'checked_in') {
    updateData.actual_check_in = new Date().toISOString()
  }

  if (status === 'checked_out') {
    updateData.actual_check_out = new Date().toISOString()
  }

  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('reservations')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating reservation status:', error)
    return { error: 'Error al actualizar el estado.' }
  }

  // On check-out, update room status
  if (status === 'checked_out') {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('room_id')
      .eq('id', id)
      .single()

    if (reservation) {
      await supabase
        .from('rooms')
        .update({ status: 'available', cleaning_status: 'dirty' })
        .eq('id', reservation.room_id)
    }
  }

  // On check-in, update room status to occupied
  if (status === 'checked_in') {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('room_id')
      .eq('id', id)
      .single()

    if (reservation) {
      await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', reservation.room_id)
    }
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
