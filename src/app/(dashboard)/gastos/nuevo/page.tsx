import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createExpense, getExpenseCategories } from '@/actions/expenses'
import { getSuppliers } from '@/actions/suppliers'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ExpenseForm } from '@/components/expenses/expense-form'

export default async function NuevoGastoPage() {
  const [categories, suppliers] = await Promise.all([
    getExpenseCategories(),
    getSuppliers(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar gasto"
        description="Captura el monto, categoría, proveedor y comprobante del gasto. Los gastos se reflejan en los reportes financieros del cenote."
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
          categories={categories}
          suppliers={suppliers}
          action={createExpense}
        />
      </div>
    </div>
  )
}
