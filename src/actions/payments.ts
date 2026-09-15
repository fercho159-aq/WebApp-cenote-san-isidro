'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/db'
import type { Payment, Charge, Refund } from '@/types'

// ---- Payments ----

export async function getPaymentsByReservation(reservationId: string) {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT *
      FROM payments
      WHERE reservation_id = ${reservationId}
      ORDER BY payment_date DESC, created_at DESC
    `
    return rows as Payment[]
  } catch (error) {
    console.error('Error fetching payments:', error)
    return []
  }
}

export async function createPayment(data: {
  reservationId: string
  amount: number
  paymentMethod: string
  referenceNumber?: string
  notes?: string
}) {
  const sql = getDb()

  if (!data.reservationId || !data.amount || data.amount <= 0) {
    return { error: 'El monto debe ser mayor a cero.' }
  }

  if (!data.paymentMethod) {
    return { error: 'Selecciona un metodo de pago.' }
  }

  try {
    await sql`
      INSERT INTO payments (
        reservation_id, amount, payment_method, reference_number,
        payment_date, notes
      ) VALUES (
        ${data.reservationId},
        ${data.amount},
        ${data.paymentMethod},
        ${data.referenceNumber || null},
        NOW(),
        ${data.notes || null}
      )
    `
  } catch (error) {
    console.error('Error creating payment:', error)
    return { error: 'Error al registrar el pago. Intente de nuevo.' }
  }

  revalidatePath(`/reservaciones/${data.reservationId}`)
  revalidatePath('/reservaciones')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function voidPayment(paymentId: string, reason: string) {
  const sql = getDb()

  if (!paymentId) {
    return { error: 'ID de pago requerido.' }
  }

  if (!reason || reason.trim().length === 0) {
    return { error: 'Debe proporcionar una razon para anular el pago.' }
  }

  try {
    const rows = await sql`
      UPDATE payments
      SET voided = true, voided_at = NOW(), voided_reason = ${reason.trim()}
      WHERE id = ${paymentId} AND voided = false
      RETURNING reservation_id
    `

    if (rows.length === 0) {
      return { error: 'Pago no encontrado o ya fue anulado.' }
    }

    const reservationId = rows[0].reservation_id

    revalidatePath(`/reservaciones/${reservationId}`)
    revalidatePath('/reservaciones')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error voiding payment:', error)
    return { error: 'Error al anular el pago. Intente de nuevo.' }
  }
}

// ---- Charges ----

export async function getChargesByReservation(reservationId: string) {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT *
      FROM charges
      WHERE reservation_id = ${reservationId}
      ORDER BY created_at DESC
    `
    return rows as Charge[]
  } catch (error) {
    console.error('Error fetching charges:', error)
    return []
  }
}

export async function createCharge(data: {
  reservationId: string
  description: string
  amount: number
  chargeType?: string
}) {
  const sql = getDb()

  if (!data.reservationId) {
    return { error: 'ID de reservacion requerido.' }
  }

  if (!data.description || data.description.trim().length === 0) {
    return { error: 'La descripcion es requerida.' }
  }

  if (!data.amount || data.amount <= 0) {
    return { error: 'El monto debe ser mayor a cero.' }
  }

  try {
    await sql`
      INSERT INTO charges (
        reservation_id, description, amount, charge_type
      ) VALUES (
        ${data.reservationId},
        ${data.description.trim()},
        ${data.amount},
        ${data.chargeType || null}
      )
    `
  } catch (error) {
    console.error('Error creating charge:', error)
    return { error: 'Error al registrar el cargo. Intente de nuevo.' }
  }

  revalidatePath(`/reservaciones/${data.reservationId}`)
  revalidatePath('/reservaciones')
  revalidatePath('/dashboard')

  return { success: true }
}

// ---- Refunds ----

export async function createRefund(data: {
  paymentId: string
  amount: number
  reason: string
}) {
  const sql = getDb()

  if (!data.paymentId) {
    return { error: 'ID de pago requerido.' }
  }

  if (!data.amount || data.amount <= 0) {
    return { error: 'El monto del reembolso debe ser mayor a cero.' }
  }

  if (!data.reason || data.reason.trim().length === 0) {
    return { error: 'La razon del reembolso es requerida.' }
  }

  try {
    // Verify the payment exists and get the amount
    const paymentRows = await sql`
      SELECT id, amount, reservation_id FROM payments
      WHERE id = ${data.paymentId} AND voided = false
    `

    if (paymentRows.length === 0) {
      return { error: 'Pago no encontrado o fue anulado.' }
    }

    // Check existing refunds total
    const refundRows = await sql`
      SELECT COALESCE(SUM(amount), 0) as total_refunded
      FROM refunds
      WHERE payment_id = ${data.paymentId}
    `

    const totalRefunded = Number(refundRows[0]?.total_refunded || 0)
    const paymentAmount = Number(paymentRows[0].amount)

    if (totalRefunded + data.amount > paymentAmount) {
      return {
        error: `El monto del reembolso excede lo disponible. Maximo reembolsable: $${(paymentAmount - totalRefunded).toFixed(2)}`,
      }
    }

    await sql`
      INSERT INTO refunds (payment_id, amount, reason)
      VALUES (${data.paymentId}, ${data.amount}, ${data.reason.trim()})
    `

    const reservationId = paymentRows[0].reservation_id

    revalidatePath(`/reservaciones/${reservationId}`)
    revalidatePath('/reservaciones')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    console.error('Error creating refund:', error)
    return { error: 'Error al registrar el reembolso. Intente de nuevo.' }
  }
}
