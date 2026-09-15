'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import type { Product, ProductCategory } from '@/types'

// ---- Categories ----

export async function getProductCategories(): Promise<ProductCategory[]> {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT * FROM product_categories
      ORDER BY sort_order ASC
    `
    return rows as ProductCategory[]
  } catch (error) {
    console.error('Error fetching product categories:', error)
    return []
  }
}

export async function getProductCategoryById(id: string): Promise<ProductCategory | null> {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT * FROM product_categories WHERE id = ${id}
    `
    return (rows[0] as ProductCategory) ?? null
  } catch (error) {
    console.error('Error fetching product category:', error)
    return null
  }
}

export async function createProductCategory(data: {
  name: string
  description?: string
  sortOrder?: number
}) {
  const sql = getDb()

  try {
    await sql`
      INSERT INTO product_categories (name, description, sort_order)
      VALUES (${data.name}, ${data.description ?? null}, ${data.sortOrder ?? 0})
    `
  } catch (error) {
    console.error('Error creating product category:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/productos')
  revalidatePath('/pos')
  return { success: true }
}

export async function updateProductCategory(
  id: string,
  data: {
    name: string
    description?: string
    sortOrder?: number
    isActive?: boolean
  }
) {
  const sql = getDb()

  try {
    await sql`
      UPDATE product_categories
      SET name = ${data.name},
          description = ${data.description ?? null},
          sort_order = ${data.sortOrder ?? 0},
          is_active = ${data.isActive ?? true},
          updated_at = now()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating product category:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/productos')
  revalidatePath('/pos')
  return { success: true }
}

export async function deleteProductCategory(id: string) {
  const sql = getDb()

  try {
    // Check if any products use this category
    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM products WHERE category_id = ${id}
    `
    if (Number(countResult[0].count) > 0) {
      return { error: 'No se puede eliminar la categoría porque tiene productos asignados.' }
    }

    await sql`DELETE FROM product_categories WHERE id = ${id}`
  } catch (error) {
    console.error('Error deleting product category:', error)
    return { error: (error as Error).message }
  }

  revalidatePath('/productos')
  revalidatePath('/pos')
  return { success: true }
}

// ---- Products ----

export async function getProducts(categoryId?: string): Promise<Product[]> {
  const sql = getDb()

  try {
    if (categoryId) {
      const rows = await sql`
        SELECT p.*,
          CASE WHEN pc.id IS NOT NULL THEN row_to_json(pc) ELSE NULL END as category
        FROM products p
        LEFT JOIN product_categories pc ON p.category_id = pc.id
        WHERE p.category_id = ${categoryId}
        ORDER BY p.sort_order ASC, p.name ASC
      `
      return rows as Product[]
    }

    const rows = await sql`
      SELECT p.*,
        CASE WHEN pc.id IS NOT NULL THEN row_to_json(pc) ELSE NULL END as category
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      ORDER BY pc.sort_order ASC, p.sort_order ASC, p.name ASC
    `
    return rows as Product[]
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT p.*,
        CASE WHEN pc.id IS NOT NULL THEN row_to_json(pc) ELSE NULL END as category
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.is_active = true AND pc.is_active = true
      ORDER BY pc.sort_order ASC, p.sort_order ASC, p.name ASC
    `
    return rows as Product[]
  } catch (error) {
    console.error('Error fetching active products:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT p.*,
        CASE WHEN pc.id IS NOT NULL THEN row_to_json(pc) ELSE NULL END as category
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.id = ${id}
    `
    return (rows[0] as Product) ?? null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function createProduct(formData: FormData) {
  const sql = getDb()

  const name = formData.get('name') as string
  const categoryId = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const cost = parseFloat(formData.get('cost') as string) || 0
  const sku = (formData.get('sku') as string) || null
  const description = (formData.get('description') as string) || null
  const trackInventory = formData.get('track_inventory') === 'on'
  const sortOrder = parseInt(formData.get('sort_order') as string) || 0

  if (!name || !categoryId) {
    return { error: 'El nombre y la categoría son obligatorios.' }
  }

  if (price < 0) {
    return { error: 'El precio no puede ser negativo.' }
  }

  try {
    await sql`
      INSERT INTO products (name, category_id, price, cost, sku, description, track_inventory, sort_order)
      VALUES (${name}, ${categoryId}, ${price}, ${cost}, ${sku}, ${description}, ${trackInventory}, ${sortOrder})
    `
  } catch (error) {
    console.error('Error creating product:', error)
    return { error: 'Error al crear el producto. Intente de nuevo.' }
  }

  revalidatePath('/productos')
  revalidatePath('/pos')
  redirect('/productos')
}

export async function updateProduct(id: string, formData: FormData) {
  const sql = getDb()

  const name = formData.get('name') as string
  const categoryId = formData.get('category_id') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const cost = parseFloat(formData.get('cost') as string) || 0
  const sku = (formData.get('sku') as string) || null
  const description = (formData.get('description') as string) || null
  const trackInventory = formData.get('track_inventory') === 'on'
  const isActive = formData.get('is_active') !== 'off'
  const sortOrder = parseInt(formData.get('sort_order') as string) || 0

  if (!name || !categoryId) {
    return { error: 'El nombre y la categoría son obligatorios.' }
  }

  if (price < 0) {
    return { error: 'El precio no puede ser negativo.' }
  }

  try {
    await sql`
      UPDATE products
      SET name = ${name},
          category_id = ${categoryId},
          price = ${price},
          cost = ${cost},
          sku = ${sku},
          description = ${description},
          track_inventory = ${trackInventory},
          is_active = ${isActive},
          sort_order = ${sortOrder},
          updated_at = now()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating product:', error)
    return { error: 'Error al actualizar el producto. Intente de nuevo.' }
  }

  revalidatePath('/productos')
  revalidatePath('/pos')
  redirect('/productos')
}

export async function deleteProduct(id: string) {
  const sql = getDb()

  try {
    // Soft delete - set is_active = false
    await sql`
      UPDATE products SET is_active = false, updated_at = now() WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error deleting product:', error)
    return { error: 'Error al desactivar el producto.' }
  }

  revalidatePath('/productos')
  revalidatePath('/pos')
  return { success: true }
}
