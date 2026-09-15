'use server'

import { getDb } from '@/lib/db'

export async function getAuditLog(filters?: {
  entityType?: string
  startDate?: string
  endDate?: string
  limit?: number
}) {
  const sql = getDb()

  const entityType = filters?.entityType || null
  const startDate = filters?.startDate || null
  const endDate = filters?.endDate || null
  const limit = filters?.limit || 50

  try {
    const rows = await sql`
      SELECT
        al.id,
        al.entity_type,
        al.entity_id,
        al.action,
        al.old_data,
        al.new_data,
        al.performed_by,
        al.performed_at,
        COALESCE(u.full_name, 'Sistema') as performer_name
      FROM audit_log al
      LEFT JOIN users u ON al.performed_by = u.id::text
      WHERE (${entityType} IS NULL OR al.entity_type = ${entityType})
        AND (${startDate} IS NULL OR al.performed_at >= ${startDate + 'T00:00:00'})
        AND (${endDate} IS NULL OR al.performed_at <= ${endDate + 'T23:59:59.999'})
      ORDER BY al.performed_at DESC
      LIMIT ${limit}
    `

    return rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      entityType: row.entity_type as string,
      entityId: row.entity_id as string,
      action: row.action as string,
      oldData: row.old_data as Record<string, unknown> | null,
      newData: row.new_data as Record<string, unknown> | null,
      performedBy: row.performed_by as string | null,
      performerName: row.performer_name as string,
      performedAt: row.performed_at as string,
    }))
  } catch (error) {
    console.error('Error fetching audit log:', error)
    return []
  }
}

export async function getAuditEntityTypes() {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT DISTINCT entity_type
      FROM audit_log
      ORDER BY entity_type ASC
    `
    return rows.map((row: Record<string, unknown>) => row.entity_type as string)
  } catch (error) {
    console.error('Error fetching audit entity types:', error)
    return []
  }
}
