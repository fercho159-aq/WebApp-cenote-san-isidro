'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import type { Expense, ExpenseCategory } from '@/types'

export async function getExpenses(filters?: {
  categoryId?: string
  startDate?: string
  endDate?: string
}) {
  const sql = getDb()

  try {
    // Build a query based on filters
    if (filters?.categoryId && filters?.startDate && filters?.endDate) {
      const rows = await sql`
        SELECT e.*,
          json_build_object('id', c.id, 'name', c.name) as category,
          CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name) ELSE NULL END as supplier
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        LEFT JOIN suppliers s ON e.supplier_id = s.id
        WHERE e.category_id = ${filters.categoryId}
          AND e.expense_date >= ${filters.startDate}::date
          AND e.expense_date <= ${filters.endDate}::date
        ORDER BY e.expense_date DESC, e.created_at DESC
      `
      return rows as Expense[]
    }

    if (filters?.categoryId) {
      const rows = await sql`
        SELECT e.*,
          json_build_object('id', c.id, 'name', c.name) as category,
          CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name) ELSE NULL END as supplier
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        LEFT JOIN suppliers s ON e.supplier_id = s.id
        WHERE e.category_id = ${filters.categoryId}
        ORDER BY e.expense_date DESC, e.created_at DESC
      `
      return rows as Expense[]
    }

    if (filters?.startDate && filters?.endDate) {
      const rows = await sql`
        SELECT e.*,
          json_build_object('id', c.id, 'name', c.name) as category,
          CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name) ELSE NULL END as supplier
        FROM expenses e
        LEFT JOIN expense_categories c ON e.category_id = c.id
        LEFT JOIN suppliers s ON e.supplier_id = s.id
        WHERE e.expense_date >= ${filters.startDate}::date
          AND e.expense_date <= ${filters.endDate}::date
        ORDER BY e.expense_date DESC, e.created_at DESC
      `
      return rows as Expense[]
    }

    const rows = await sql`
      SELECT e.*,
        json_build_object('id', c.id, 'name', c.name) as category,
        CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name) ELSE NULL END as supplier
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      LEFT JOIN suppliers s ON e.supplier_id = s.id
      ORDER BY e.expense_date DESC, e.created_at DESC
    `
    return rows as Expense[]
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return []
  }
}

export async function getExpenseCategories() {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT * FROM expense_categories ORDER BY sort_order ASC
    `
    return rows as ExpenseCategory[]
  } catch (error) {
    console.error('Error fetching expense categories:', error)
    return []
  }
}

export async function getExpenseById(id: string) {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT e.*,
        json_build_object('id', c.id, 'name', c.name) as category,
        CASE WHEN s.id IS NOT NULL THEN json_build_object('id', s.id, 'name', s.name) ELSE NULL END as supplier
      FROM expenses e
      LEFT JOIN expense_categories c ON e.category_id = c.id
      LEFT JOIN suppliers s ON e.supplier_id = s.id
      WHERE e.id = ${id}
    `
    return (rows[0] as Expense) ?? null
  } catch (error) {
    console.error('Error fetching expense:', error)
    return null
  }
}

export async function createExpense(formData: FormData) {
  const sql = getDb()

  const categoryId = formData.get('category_id') as string
  const supplierId = (formData.get('supplier_id') as string) || null
  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const expenseDate = formData.get('expense_date') as string
  const paymentMethod = (formData.get('payment_method') as string) || null
  const reference = (formData.get('reference') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!categoryId || !description || !amount || !expenseDate) {
    return { error: 'La categoria, descripcion, monto y fecha son obligatorios.' }
  }

  if (isNaN(amount) || amount <= 0) {
    return { error: 'El monto debe ser un numero mayor a cero.' }
  }

  try {
    await sql`
      INSERT INTO expenses (category_id, supplier_id, description, amount, expense_date, payment_method, reference, notes)
      VALUES (${categoryId}, ${supplierId}, ${description}, ${amount}, ${expenseDate}::date, ${paymentMethod}, ${reference}, ${notes})
    `
  } catch (error) {
    console.error('Error creating expense:', error)
    return { error: 'Error al registrar el gasto. Intente de nuevo.' }
  }

  revalidatePath('/gastos')
  redirect('/gastos')
}

export async function updateExpense(id: string, formData: FormData) {
  const sql = getDb()

  const categoryId = formData.get('category_id') as string
  const supplierId = (formData.get('supplier_id') as string) || null
  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const expenseDate = formData.get('expense_date') as string
  const paymentMethod = (formData.get('payment_method') as string) || null
  const reference = (formData.get('reference') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!categoryId || !description || !amount || !expenseDate) {
    return { error: 'La categoria, descripcion, monto y fecha son obligatorios.' }
  }

  if (isNaN(amount) || amount <= 0) {
    return { error: 'El monto debe ser un numero mayor a cero.' }
  }

  try {
    await sql`
      UPDATE expenses SET
        category_id = ${categoryId},
        supplier_id = ${supplierId},
        description = ${description},
        amount = ${amount},
        expense_date = ${expenseDate}::date,
        payment_method = ${paymentMethod},
        reference = ${reference},
        notes = ${notes},
        updated_at = NOW()
      WHERE id = ${id}
    `
  } catch (error) {
    console.error('Error updating expense:', error)
    return { error: 'Error al actualizar el gasto. Intente de nuevo.' }
  }

  revalidatePath('/gastos')
  redirect('/gastos')
}

export async function deleteExpense(id: string) {
  const sql = getDb()

  try {
    await sql`DELETE FROM expenses WHERE id = ${id}`
  } catch (error) {
    console.error('Error deleting expense:', error)
    return { error: 'Error al eliminar el gasto.' }
  }

  revalidatePath('/gastos')
  redirect('/gastos')
}

export async function getExpenseSummary(startDate: string, endDate: string) {
  const sql = getDb()

  try {
    const rows = await sql`
      SELECT
        c.name as category_name,
        COALESCE(SUM(e.amount), 0)::numeric as total
      FROM expense_categories c
      LEFT JOIN expenses e ON e.category_id = c.id
        AND e.expense_date >= ${startDate}::date
        AND e.expense_date <= ${endDate}::date
      GROUP BY c.id, c.name, c.sort_order
      ORDER BY c.sort_order ASC
    `

    const categoryRows = rows as { category_name: string; total: string }[]
    const grandTotal = categoryRows.reduce(
      (sum, r) => sum + parseFloat(r.total || '0'),
      0
    )

    return {
      byCategory: categoryRows.map((r) => ({
        category_name: r.category_name,
        total: parseFloat(r.total || '0'),
      })),
      grandTotal,
    }
  } catch (error) {
    console.error('Error fetching expense summary:', error)
    return { byCategory: [], grandTotal: 0 }
  }
}
