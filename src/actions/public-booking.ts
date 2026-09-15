'use server'

import { getDb } from '@/lib/db'
import { TAX_RATE } from '@/lib/constants'

export async function getPublicRooms() {
  const sql = getDb()
  try {
    const rows = await sql`
      SELECT r.id, r.name, r.status, r.sort_order,
        CASE WHEN rc.id IS NOT NULL THEN row_to_json(rc) ELSE NULL END as category
      FROM rooms r
      LEFT JOIN room_categories rc ON r.category_id = rc.id
      ORDER BY r.sort_order ASC
    `
    return rows
  } catch (error) {
    console.error('Error fetching public rooms:', error)
    return []
  }
}

export async function checkAvailability(checkIn: string, checkOut: string) {
  const sql = getDb()
  try {
    const rows = await sql`
      SELECT r.id, r.name, r.sort_order,
        CASE WHEN rc.id IS NOT NULL THEN
          json_build_object(
            'id', rc.id, 'name', rc.name, 'description', rc.description,
            'base_price', rc.base_price, 'max_occupancy', rc.max_adults + rc.max_children
          )
        ELSE NULL END as category
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
      ORDER BY rc.base_price ASC, r.sort_order ASC
    `
    return rows
  } catch (error) {
    console.error('Error checking availability:', error)
    return []
  }
}

export async function getPublicPackages() {
  const sql = getDb()
  try {
    const [categories, packages] = await Promise.all([
      sql`SELECT * FROM package_categories WHERE is_active = TRUE ORDER BY sort_order ASC`,
      sql`SELECT * FROM packages WHERE is_active = TRUE ORDER BY sort_order ASC`,
    ])
    return { categories, packages }
  } catch (error) {
    console.error('Error fetching public packages:', error)
    return { categories: [], packages: [] }
  }
}

export async function createPublicReservation(data: {
  checkIn: string
  checkOut: string
  roomId: string
  adults: number
  children: number
  guestFirstName: string
  guestLastName: string
  guestEmail: string
  guestPhone: string
  notes?: string
  packages?: { packageId: string; quantity: number }[]
}) {
  const sql = getDb()

  const checkIn = new Date(data.checkIn)
  const checkOut = new Date(data.checkOut)
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

  if (nights <= 0) {
    return { error: 'La fecha de salida debe ser posterior a la de llegada.' }
  }

  try {
    // Get room rate
    const roomRows = await sql`
      SELECT r.*, rc.base_price
      FROM rooms r
      LEFT JOIN room_categories rc ON r.category_id = rc.id
      WHERE r.id = ${data.roomId}
    `
    if (roomRows.length === 0) return { error: 'Cabaña no encontrada.' }

    const nightlyRate = Number(roomRows[0].base_price) || 0

    // Check availability
    const conflicts = await sql`
      SELECT 1 FROM reservations
      WHERE room_id = ${data.roomId}
        AND status IN ('pending', 'confirmed', 'checked_in')
        AND check_in_date < ${data.checkOut}
        AND check_out_date > ${data.checkIn}
      LIMIT 1
    `
    if (conflicts.length > 0) {
      return { error: 'La cabaña ya no está disponible para esas fechas.' }
    }

    // Create or find guest
    let guestId: string
    const existingGuest = await sql`
      SELECT id FROM guests WHERE email = ${data.guestEmail} LIMIT 1
    `
    if (existingGuest.length > 0) {
      guestId = existingGuest[0].id as string
    } else {
      const newGuest = await sql`
        INSERT INTO guests (first_name, last_name, email, phone)
        VALUES (${data.guestFirstName}, ${data.guestLastName}, ${data.guestEmail}, ${data.guestPhone})
        RETURNING id
      `
      guestId = newGuest[0].id as string
    }

    // Calculate totals
    let subtotal = nightlyRate * nights
    const taxAmount = subtotal * TAX_RATE
    let packagesTotal = 0

    // Calculate package costs
    const packageDetails: { packageId: string; quantity: number; unitPrice: number; totalPrice: number }[] = []
    if (data.packages && data.packages.length > 0) {
      for (const pkg of data.packages) {
        const pkgRows = await sql`SELECT * FROM packages WHERE id = ${pkg.packageId} AND is_active = TRUE`
        if (pkgRows.length > 0) {
          const p = pkgRows[0]
          let unitPrice = Number(p.price)
          let totalPrice = 0

          switch (p.price_type) {
            case 'per_person':
              totalPrice = unitPrice * pkg.quantity
              break
            case 'per_night':
              totalPrice = unitPrice * nights * pkg.quantity
              break
            case 'per_person_per_night':
              totalPrice = unitPrice * (data.adults + data.children) * nights * pkg.quantity
              break
            case 'per_reservation':
            default:
              totalPrice = unitPrice * pkg.quantity
              break
          }

          packagesTotal += totalPrice
          packageDetails.push({ packageId: pkg.packageId, quantity: pkg.quantity, unitPrice, totalPrice })
        }
      }
    }

    const total = subtotal + taxAmount + packagesTotal

    // Generate reservation number
    const now = new Date()
    const year = now.getFullYear().toString().slice(-2)
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const reservationNumber = `RSV-${year}${month}-${random}`

    // Create reservation
    const resRows = await sql`
      INSERT INTO reservations (
        reservation_number, guest_id, room_id, check_in_date, check_out_date,
        adults, children, status, payment_status, booking_channel,
        nightly_rate, subtotal, tax_rate, tax_amount, total, amount_paid,
        notes
      ) VALUES (
        ${reservationNumber}, ${guestId}, ${data.roomId}, ${data.checkIn}, ${data.checkOut},
        ${data.adults}, ${data.children}, 'pending', 'unpaid', 'booking_engine',
        ${nightlyRate}, ${subtotal}, ${TAX_RATE}, ${taxAmount}, ${total}, ${0},
        ${data.notes || null}
      ) RETURNING id
    `
    const reservationId = resRows[0].id as string

    // Insert reservation packages
    for (const pkg of packageDetails) {
      await sql`
        INSERT INTO reservation_packages (reservation_id, package_id, quantity, unit_price, total_price)
        VALUES (${reservationId}, ${pkg.packageId}, ${pkg.quantity}, ${pkg.unitPrice}, ${pkg.totalPrice})
      `
    }

    return {
      success: true,
      reservationNumber,
      reservationId,
      total,
      nights,
      nightlyRate,
      packagesTotal,
    }
  } catch (error) {
    console.error('Error creating public reservation:', error)
    return { error: 'Error al crear la reservación. Intente de nuevo.' }
  }
}

export async function recordBookingPayment(data: {
  reservationId: string
  amount: number
  method: string // 'card' | 'transfer' | 'cash'
  reference?: string
}) {
  const sql = getDb()
  try {
    // Record the payment
    await sql`
      INSERT INTO payments (reservation_id, amount, payment_method, reference_number, notes)
      VALUES (${data.reservationId}, ${data.amount}, ${data.method}, ${data.reference || null}, ${'Pago desde booking engine'})
    `

    // Update the reservation's amount_paid and payment_status
    await sql`
      UPDATE reservations
      SET amount_paid = amount_paid + ${data.amount},
          payment_status = CASE
            WHEN amount_paid + ${data.amount} >= total THEN 'paid'
            WHEN amount_paid + ${data.amount} > 0 THEN 'partial'
            ELSE 'unpaid'
          END,
          status = 'confirmed'
      WHERE id = ${data.reservationId}
    `

    return { success: true }
  } catch (error) {
    console.error('Error recording payment:', error)
    return { error: 'Error al procesar el pago.' }
  }
}
