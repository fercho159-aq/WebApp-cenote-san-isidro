'use server'

import { getDb } from '@/lib/db'

export async function getOccupancyReport(startDate: string, endDate: string) {
  const sql = getDb()

  try {
    // Get total rooms count
    const totalRoomsResult = await sql`SELECT COUNT(*)::int as count FROM rooms`
    const totalRooms = totalRoomsResult[0].count || 0

    // Get daily occupied rooms (rooms with checked_in reservations on each date)
    const dailyData = await sql`
      WITH date_series AS (
        SELECT generate_series(
          ${startDate}::date,
          ${endDate}::date,
          '1 day'::interval
        )::date AS date
      )
      SELECT
        ds.date::text as date,
        COUNT(DISTINCT r.room_id)::int as occupied_rooms
      FROM date_series ds
      LEFT JOIN reservations r ON
        r.check_in_date <= ds.date
        AND r.check_out_date > ds.date
        AND r.status IN ('checked_in', 'checked_out', 'confirmed')
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `

    const days = dailyData.map((row: Record<string, unknown>) => ({
      date: row.date as string,
      occupiedRooms: row.occupied_rooms as number,
      totalRooms,
      occupancyPercent: totalRooms > 0
        ? Math.round(((row.occupied_rooms as number) / totalRooms) * 100)
        : 0,
    }))

    const avgOccupancy = days.length > 0
      ? Math.round(days.reduce((sum: number, d: { occupancyPercent: number }) => sum + d.occupancyPercent, 0) / days.length)
      : 0

    const peakDay = days.length > 0
      ? days.reduce((max: { occupancyPercent: number; date: string }, d: { occupancyPercent: number; date: string }) =>
          d.occupancyPercent > max.occupancyPercent ? d : max, days[0])
      : null

    return { days, totalRooms, avgOccupancy, peakDay }
  } catch (error) {
    console.error('Error fetching occupancy report:', error)
    return { days: [], totalRooms: 0, avgOccupancy: 0, peakDay: null }
  }
}

export async function getRevenueReport(startDate: string, endDate: string) {
  const sql = getDb()

  try {
    // Room revenue from reservations in the period
    const roomRevenueResult = await sql`
      SELECT COALESCE(SUM(total), 0) as room_revenue,
             COALESCE(SUM(amount_paid), 0) as room_collected
      FROM reservations
      WHERE check_in_date >= ${startDate}
        AND check_in_date <= ${endDate}
        AND status NOT IN ('cancelled', 'no_show')
    `

    // Package revenue (from package_reservations if it exists, otherwise 0)
    let packageRevenue = 0
    try {
      const pkgResult = await sql`
        SELECT COALESCE(SUM(pr.total_price), 0) as total
        FROM package_reservations pr
        JOIN reservations r ON pr.reservation_id = r.id
        WHERE r.check_in_date >= ${startDate}
          AND r.check_in_date <= ${endDate}
          AND r.status NOT IN ('cancelled', 'no_show')
      `
      packageRevenue = Number(pkgResult[0].total)
    } catch {
      // package_reservations table may not exist
    }

    // Payments received in the period
    const paymentsResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total_payments
      FROM payments
      WHERE created_at >= ${startDate + 'T00:00:00'}
        AND created_at <= ${endDate + 'T23:59:59.999'}
        AND voided = false
    `

    // Daily payments breakdown
    const dailyPayments = await sql`
      WITH date_series AS (
        SELECT generate_series(
          ${startDate}::date,
          ${endDate}::date,
          '1 day'::interval
        )::date AS date
      )
      SELECT
        ds.date::text as date,
        COALESCE(SUM(p.amount), 0) as total
      FROM date_series ds
      LEFT JOIN payments p ON p.created_at::date = ds.date AND p.voided = false
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `

    return {
      roomRevenue: Number(roomRevenueResult[0].room_revenue),
      roomCollected: Number(roomRevenueResult[0].room_collected),
      packageRevenue,
      totalPayments: Number(paymentsResult[0].total_payments),
      dailyPayments: dailyPayments.map((row: Record<string, unknown>) => ({
        date: row.date as string,
        total: Number(row.total),
      })),
    }
  } catch (error) {
    console.error('Error fetching revenue report:', error)
    return { roomRevenue: 0, roomCollected: 0, packageRevenue: 0, totalPayments: 0, dailyPayments: [] }
  }
}

export async function getReservationReport(startDate: string, endDate: string) {
  const sql = getDb()

  try {
    // Total and by status
    const byStatus = await sql`
      SELECT status, COUNT(*)::int as count
      FROM reservations
      WHERE check_in_date >= ${startDate}
        AND check_in_date <= ${endDate}
      GROUP BY status
    `

    const total = byStatus.reduce((sum: number, row: Record<string, unknown>) => sum + (row.count as number), 0)

    // By channel
    const byChannel = await sql`
      SELECT booking_channel, COUNT(*)::int as count
      FROM reservations
      WHERE check_in_date >= ${startDate}
        AND check_in_date <= ${endDate}
        AND status NOT IN ('cancelled', 'no_show')
      GROUP BY booking_channel
      ORDER BY count DESC
    `

    // Average stay duration
    const avgStayResult = await sql`
      SELECT COALESCE(AVG(nights), 0) as avg_nights,
             COALESCE(AVG(nightly_rate), 0) as avg_rate
      FROM reservations
      WHERE check_in_date >= ${startDate}
        AND check_in_date <= ${endDate}
        AND status NOT IN ('cancelled', 'no_show')
    `

    return {
      total,
      byStatus: byStatus.map((row: Record<string, unknown>) => ({
        status: row.status as string,
        count: row.count as number,
      })),
      byChannel: byChannel.map((row: Record<string, unknown>) => ({
        channel: row.booking_channel as string,
        count: row.count as number,
      })),
      avgNights: Math.round(Number(avgStayResult[0].avg_nights) * 10) / 10,
      avgRate: Math.round(Number(avgStayResult[0].avg_rate) * 100) / 100,
    }
  } catch (error) {
    console.error('Error fetching reservation report:', error)
    return { total: 0, byStatus: [], byChannel: [], avgNights: 0, avgRate: 0 }
  }
}

export async function getGuestReport(startDate: string, endDate: string) {
  const sql = getDb()

  try {
    // New guests (created in period)
    const newGuestsResult = await sql`
      SELECT COUNT(*)::int as count
      FROM guests
      WHERE created_at >= ${startDate}
        AND created_at <= ${endDate + 'T23:59:59.999'}
    `

    // Returning guests (guests with more than 1 reservation)
    const returningResult = await sql`
      SELECT COUNT(DISTINCT g.id)::int as count
      FROM guests g
      WHERE g.total_stays > 1
        AND EXISTS (
          SELECT 1 FROM reservations r
          WHERE r.guest_id = g.id
            AND r.check_in_date >= ${startDate}
            AND r.check_in_date <= ${endDate}
            AND r.status NOT IN ('cancelled', 'no_show')
        )
    `

    // Top guests by revenue
    const topGuests = await sql`
      SELECT
        g.id,
        g.first_name,
        g.last_name,
        COALESCE(SUM(r.total), 0) as total_revenue,
        COUNT(r.id)::int as reservation_count
      FROM guests g
      JOIN reservations r ON r.guest_id = g.id
      WHERE r.check_in_date >= ${startDate}
        AND r.check_in_date <= ${endDate}
        AND r.status NOT IN ('cancelled', 'no_show')
      GROUP BY g.id, g.first_name, g.last_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `

    return {
      newGuests: newGuestsResult[0].count as number,
      returningGuests: returningResult[0].count as number,
      topGuests: topGuests.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        name: `${row.first_name} ${row.last_name}`,
        totalRevenue: Number(row.total_revenue),
        reservationCount: row.reservation_count as number,
      })),
    }
  } catch (error) {
    console.error('Error fetching guest report:', error)
    return { newGuests: 0, returningGuests: 0, topGuests: [] }
  }
}
