'use server'
import { getDb } from '@/lib/db'

export async function getPublicCabanas() {
  const sql = getDb()
  try {
    const rows = await sql`
      SELECT r.id, r.name, r.status, r.sort_order,
        rc.name as category_name, rc.description as category_description,
        rc.base_price, rc.max_adults, rc.max_children
      FROM rooms r
      LEFT JOIN room_categories rc ON r.category_id = rc.id
      WHERE r.status != 'maintenance'
      ORDER BY r.sort_order ASC
    `
    return rows
  } catch (error) {
    console.error('Error fetching public cabanas:', error)
    return []
  }
}
