'use server'

import { getDb } from '@/lib/db'

export async function getDailyControl(date: string) {
  const sql = getDb()

  try {
    const [
      arrivalsResult,
      departuresResult,
      inHouseResult,
      totalRoomsResult,
      paymentsResult,
      roomRevenueResult,
    ] = await Promise.all([
      // Arrivals for the date
      sql`
        SELECT res.*,
          CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
          CASE WHEN rm.id IS NOT NULL THEN json_build_object('id', rm.id, 'name', rm.name) ELSE NULL END as room
        FROM reservations res
        LEFT JOIN guests g ON res.guest_id = g.id
        LEFT JOIN rooms rm ON res.room_id = rm.id
        WHERE res.check_in_date = ${date}
          AND res.status IN ('pending', 'confirmed', 'checked_in')
        ORDER BY res.created_at ASC
      `,

      // Departures for the date
      sql`
        SELECT res.*,
          CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
          CASE WHEN rm.id IS NOT NULL THEN json_build_object('id', rm.id, 'name', rm.name) ELSE NULL END as room
        FROM reservations res
        LEFT JOIN guests g ON res.guest_id = g.id
        LEFT JOIN rooms rm ON res.room_id = rm.id
        WHERE res.check_out_date = ${date}
          AND res.status IN ('checked_in', 'checked_out')
        ORDER BY res.created_at ASC
      `,

      // In-house count (checked_in whose stay spans this date)
      sql`
        SELECT COUNT(DISTINCT res.id)::int as count
        FROM reservations res
        WHERE res.status = 'checked_in'
          AND res.check_in_date <= ${date}
          AND res.check_out_date > ${date}
      `,

      // Total rooms
      sql`SELECT COUNT(*)::int as count FROM rooms`,

      // Payments received on this date
      sql`
        SELECT COALESCE(SUM(amount), 0) as total,
               COUNT(*)::int as count
        FROM payments
        WHERE created_at >= ${date + 'T00:00:00'}
          AND created_at < ${date + 'T23:59:59.999'}
          AND voided = false
      `,

      // Room revenue for reservations with check-in on this date
      sql`
        SELECT COALESCE(SUM(total), 0) as total
        FROM reservations
        WHERE check_in_date = ${date}
          AND status NOT IN ('cancelled', 'no_show')
      `,
    ])

    const inHouseCount = inHouseResult[0].count as number
    const totalRooms = totalRoomsResult[0].count as number
    const availableRooms = totalRooms - inHouseCount

    return {
      arrivals: arrivalsResult,
      departures: departuresResult,
      arrivalsCount: arrivalsResult.length,
      departuresCount: departuresResult.length,
      inHouseCount,
      totalRooms,
      availableRooms,
      paymentsReceived: Number(paymentsResult[0].total),
      paymentsCount: paymentsResult[0].count as number,
      roomRevenue: Number(roomRevenueResult[0].total),
    }
  } catch (error) {
    console.error('Error fetching daily control:', error)
    return {
      arrivals: [],
      departures: [],
      arrivalsCount: 0,
      departuresCount: 0,
      inHouseCount: 0,
      totalRooms: 0,
      availableRooms: 0,
      paymentsReceived: 0,
      paymentsCount: 0,
      roomRevenue: 0,
    }
  }
}

export async function getDailySummary(date: string) {
  const sql = getDb()

  try {
    // Payments received (income)
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE created_at >= ${date + 'T00:00:00'}
        AND created_at < ${date + 'T23:59:59.999'}
        AND voided = false
    `

    // For now, expenses are 0 since there's no expenses table with daily tracking
    // This can be extended when the expenses module is built
    const expenses = 0

    const income = Number(incomeResult[0].total)

    return {
      income,
      expenses,
      net: income - expenses,
    }
  } catch (error) {
    console.error('Error fetching daily summary:', error)
    return { income: 0, expenses: 0, net: 0 }
  }
}
