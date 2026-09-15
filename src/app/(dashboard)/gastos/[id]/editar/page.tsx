import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  getExpenseById,
  getExpenseCategories,
  updateExpense,
} from '@/actions/expenses'
import { getSuppliers } from '@/actions/suppliers'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ExpenseForm } from '@/components/expenses/expense-form'

export default async function EditarGastoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [expense, categories, suppliers] = await Promise.all([
    getExpenseById(id),
    getExpenseCategories(),
    getSuppliers(),
  ])

  if (!expense) {
    notFound()
  }

  const updateExpenseWithId = async (formData: FormData) => {
    'use server'
    return updateExpense(id, formData)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar gasto"
        description={expense.description}
      >
        <Button variant="outline" asChild>
          <Link href="/gastos">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <ExpenseForm
          expense={expense}
          categories={categories}
          suppliers={suppliers}
          action={updateExpenseWithId}
        />
      </div>
    </div>
  )
}
