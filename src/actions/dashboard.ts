'use server'

import { getDb } from '@/lib/db'

export interface DashboardStats {
  arrivalsToday: number
  departuresToday: number
  occupiedRooms: number
  availableRooms: number
  todayIncome: number
  dirtyRooms: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const sql = getDb()
  const today = new Date().toISOString().split('T')[0]

  const [
    arrivalsResult,
    departuresResult,
    occupiedResult,
    availableResult,
    incomeResult,
    dirtyResult,
  ] = await Promise.all([
    // Today's arrivals
    sql`SELECT COUNT(*)::int as count FROM reservations WHERE check_in_date = ${today} AND status IN ('confirmed', 'pending')`,

    // Today's departures
    sql`SELECT COUNT(*)::int as count FROM reservations WHERE check_out_date = ${today} AND status = 'checked_in'`,

    // Occupied rooms
    sql`SELECT COUNT(*)::int as count FROM rooms WHERE status = 'occupied'`,

    // Available rooms
    sql`SELECT COUNT(*)::int as count FROM rooms WHERE status = 'available'`,

    // Today's income
    sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE created_at >= ${today + 'T00:00:00'} AND created_at < ${today + 'T23:59:59.999'}`,

    // Dirty rooms
    sql`SELECT COUNT(*)::int as count FROM rooms WHERE cleaning_status = 'dirty'`,
  ])

  return {
    arrivalsToday: arrivalsResult[0].count,
    departuresToday: departuresResult[0].count,
    occupiedRooms: occupiedResult[0].count,
    availableRooms: availableResult[0].count,
    todayIncome: Number(incomeResult[0].total),
    dirtyRooms: dirtyResult[0].count,
  }
}

export async function getRecentReservations() {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT res.*,
        CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
        CASE WHEN rm.id IS NOT NULL THEN json_build_object('name', rm.name) ELSE NULL END as room
      FROM reservations res
      LEFT JOIN guests g ON res.guest_id = g.id
      LEFT JOIN rooms rm ON res.room_id = rm.id
      ORDER BY res.created_at DESC
      LIMIT 5
    `
    return rows
  } catch (error) {
    console.error('Error fetching recent reservations:', error)
    return []
  }
}

export async function getTodayMovements() {
  const sql = getDb()
  const today = new Date().toISOString().split('T')[0]

  try {
    const [arrivals, departures] = await Promise.all([
      sql`
        SELECT res.*,
          CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
          CASE WHEN rm.id IS NOT NULL THEN json_build_object('name', rm.name) ELSE NULL END as room
        FROM reservations res
        LEFT JOIN guests g ON res.guest_id = g.id
        LEFT JOIN rooms rm ON res.room_id = rm.id
        WHERE res.check_in_date = ${today}
          AND res.status IN ('confirmed', 'pending', 'checked_in')
      `,
      sql`
        SELECT res.*,
          CASE WHEN g.id IS NOT NULL THEN row_to_json(g) ELSE NULL END as guest,
          CASE WHEN rm.id IS NOT NULL THEN json_build_object('name', rm.name) ELSE NULL END as room
        FROM reservations res
        LEFT JOIN guests g ON res.guest_id = g.id
        LEFT JOIN rooms rm ON res.room_id = rm.id
        WHERE res.check_out_date = ${today}
          AND res.status IN ('checked_in', 'checked_out')
      `,
    ])

    return {
      arrivals,
      departures,
    }
  } catch (error) {
    console.error('Error fetching today movements:', error)
    return {
      arrivals: [],
      departures: [],
    }
  }
}
