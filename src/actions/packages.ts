'use server'

import { getDb } from '@/lib/db'

export interface PackageCategory {
  id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
}

export interface Package {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  price_type: 'per_person' | 'per_night' | 'per_reservation' | 'per_person_per_night'
  is_active: boolean
  sort_order: number
  category?: PackageCategory | null
}

export async function getPackageCategories(): Promise<PackageCategory[]> {
  const sql = getDb()
  try {
    const rows = await sql`
      SELECT * FROM package_categories
      WHERE is_active = TRUE
      ORDER BY sort_order ASC
    `
    return rows as PackageCategory[]
  } catch (error) {
    console.error('Error fetching package categories:', error)
    return []
  }
}

export async function getPackages(): Promise<Package[]> {
  const sql = getDb()
  try {
    const rows = await sql`
      SELECT p.*,
        CASE WHEN pc.id IS NOT NULL THEN row_to_json(pc) ELSE NULL END as category
      FROM packages p
      LEFT JOIN package_categories pc ON p.category_id = pc.id
      WHERE p.is_active = TRUE
      ORDER BY pc.sort_order ASC, p.sort_order ASC
    `
    return rows as Package[]
  } catch (error) {
    console.error('Error fetching packages:', error)
    return []
  }
}

export async function getPackagesByCategory(): Promise<{ category: PackageCategory; packages: Package[] }[]> {
  const sql = getDb()
  try {
    const [categories, packages] = await Promise.all([
      sql`SELECT * FROM package_categories WHERE is_active = TRUE ORDER BY sort_order ASC`,
      sql`SELECT * FROM packages WHERE is_active = TRUE ORDER BY sort_order ASC`,
    ])

    return (categories as PackageCategory[]).map(cat => ({
      category: cat,
      packages: (packages as Package[]).filter(p => p.category_id === cat.id),
    }))
  } catch (error) {
    console.error('Error fetching packages by category:', error)
    return []
  }
}
