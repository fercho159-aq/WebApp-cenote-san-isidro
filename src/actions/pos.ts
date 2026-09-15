'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/db'
import { TAX_RATE } from '@/lib/constants'
import type { PosSale } from '@/types'

export async function createSale(data: {
  items: { productId: string; quantity: number; unitPrice: number }[]
  paymentMethod: string
  reservationId?: string
  notes?: string
}) {
  const sql = getDb()

  if (!data.items || data.items.length === 0) {
    return { error: 'Debe agregar al menos un producto.' }
  }

  if (!data.paymentMethod) {
    return { error: 'Debe seleccionar un método de pago.' }
  }

  // Calculate totals
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100

  // Generate sale number
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  const saleNumber = `VTA-${year}${month}-${random}`

  try {
    // Insert sale
    const saleRows = await sql`
      INSERT INTO pos_sales (sale_number, reservation_id, payment_method, subtotal, tax_amount, total, notes)
      VALUES (
        ${saleNumber},
        ${data.reservationId ?? null},
        ${data.paymentMethod},
        ${subtotal},
        ${taxAmount},
        ${total},
        ${data.notes ?? null}
      )
      RETURNING id
    `
    const saleId = (saleRows[0] as { id: string }).id

    // Insert line items
    for (const item of data.items) {
      const lineTotal = Math.round(item.unitPrice * item.quantity * 100) / 100
      await sql`
        INSERT INTO pos_sale_items (sale_id, product_id, quantity, unit_price, total_price)
        VALUES (${saleId}, ${item.productId}, ${item.quantity}, ${item.unitPrice}, ${lineTotal})
      `
    }

    revalidatePath('/pos')
    return { success: true, saleId, saleNumber }
  } catch (error) {
    console.error('Error creating sale:', error)
    return { error: 'Error al registrar la venta. Intente de nuevo.' }
  }
}

export async function getSales(filters?: {
  date?: string
  status?: string
}): Promise<PosSale[]> {
  const sql = getDb()

  try {
    const hasDate = !!filters?.date
    const hasStatus = !!filters?.status && filters.status !== 'all'

    if (hasDate && hasStatus) {
      const rows = await sql`
        SELECT s.* FROM pos_sales s
        WHERE DATE(s.created_at) = ${filters!.date!}::date
          AND s.status = ${filters!.status!}
        ORDER BY s.created_at DESC LIMIT 100
      `
      return rows as PosSale[]
    } else if (hasDate) {
      const rows = await sql`
        SELECT s.* FROM pos_sales s
        WHERE DATE(s.created_at) = ${filters!.date!}::date
        ORDER BY s.created_at DESC LIMIT 100
      `
      return rows as PosSale[]
    } else if (hasStatus) {
      const rows = await sql`
        SELECT s.* FROM pos_sales s
        WHERE s.status = ${filters!.status!}
        ORDER BY s.created_at DESC LIMIT 100
      `
      return rows as PosSale[]
    } else {
      const rows = await sql`
        SELECT s.* FROM pos_sales s
        ORDER BY s.created_at DESC LIMIT 100
      `
      return rows as PosSale[]
    }
  } catch (error) {
    console.error('Error fetching sales:', error)
    return []
  }
}

export async function getSaleById(id: string): Promise<PosSale | null> {
  const sql = getDb()

  try {
    const saleRows = await sql`
      SELECT * FROM pos_sales WHERE id = ${id}
    `
    if (saleRows.length === 0) return null

    const sale = saleRows[0] as PosSale

    const itemRows = await sql`
      SELECT si.*,
        CASE WHEN p.id IS NOT NULL THEN row_to_json(p) ELSE NULL END as product
      FROM pos_sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ${id}
      ORDER BY si.id ASC
    `

    return {
      ...sale,
      items: itemRows as PosSale['items'],
    }
  } catch (error) {
    console.error('Error fetching sale:', error)
    return null
  }
}

export async function voidSale(id: string, reason: string) {
  const sql = getDb()

  if (!reason || reason.trim().length === 0) {
    return { error: 'Debe indicar el motivo de la anulación.' }
  }

  try {
    const existing = await sql`SELECT status FROM pos_sales WHERE id = ${id}`
    if (existing.length === 0) {
      return { error: 'Venta no encontrada.' }
    }
    if (existing[0].status === 'voided') {
      return { error: 'Esta venta ya fue anulada.' }
    }

    await sql`
      UPDATE pos_sales
      SET status = 'voided',
          notes = COALESCE(notes || ' | ', '') || ${'ANULADA: ' + reason.trim()}
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error voiding sale:', error)
    return { error: 'Error al anular la venta.' }
  }

  revalidatePath('/pos')
  return { success: true }
}

export async function getCheckedInReservations() {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT res.id, res.reservation_number,
        g.first_name || ' ' || g.last_name as guest_name,
        rm.name as room_name
      FROM reservations res
      LEFT JOIN guests g ON res.guest_id = g.id
      LEFT JOIN rooms rm ON res.room_id = rm.id
      WHERE res.status = 'checked_in'
      ORDER BY rm.name ASC
    `
    return rows as { id: string; reservation_number: string; guest_name: string; room_name: string }[]
  } catch (error) {
    console.error('Error fetching checked-in reservations:', error)
    return []
  }
}
