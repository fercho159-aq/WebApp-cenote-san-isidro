import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, DollarSign } from 'lucide-react'
import {
  getExpenses,
  getExpenseCategories,
  getExpenseSummary,
} from '@/actions/expenses'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { ExpenseFilters } from '@/components/expenses/expense-filters'
import { ExpenseTable } from '@/components/expenses/expense-table'
import { ExpenseSummary } from '@/components/expenses/expense-summary'

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoryId?: string
    startDate?: string
    endDate?: string
  }>
}) {
  const { categoryId, startDate, endDate } = await searchParams
  const categories = await getExpenseCategories()

  // Default date range: current month
  const now = new Date()
  const defaultStart =
    startDate ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const defaultEnd =
    endDate ??
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const [expenses, summary] = await Promise.all([
    getExpenses({
      categoryId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    getExpenseSummary(defaultStart, defaultEnd),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos"
        description="Registra y controla todos los gastos operativos del cenote: mantenimiento, servicios, nómina, insumos y más. Filtra por categoría y rango de fechas."
      >
        <Button asChild>
          <Link href="/gastos/nuevo">
            <Plus className="h-4 w-4" />
            Registrar gasto
          </Link>
        </Button>
      </PageHeader>

      <ExpenseSummary
        byCategory={summary.byCategory}
        grandTotal={summary.grandTotal}
      />

      <Suspense>
        <ExpenseFilters categories={categories} />
      </Suspense>

      {expenses.length > 0 ? (
        <ExpenseTable expenses={expenses} />
      ) : (
        <EmptyState
          icon={DollarSign}
          title="No hay gastos registrados"
          description={
            categoryId || startDate || endDate
              ? 'No se encontraron gastos con los filtros seleccionados.'
              : 'Registra tu primer gasto para comenzar a llevar el control.'
          }
        >
          {!categoryId && !startDate && !endDate && (
            <Button asChild>
              <Link href="/gastos/nuevo">
                <Plus className="h-4 w-4" />
                Registrar gasto
              </Link>
            </Button>
          )}
        </EmptyState>
      )}
    </div>
  )
}
