import { formatCurrency } from '@/lib/formatters'

interface ExpenseSummaryProps {
  byCategory: { category_name: string; total: number }[]
  grandTotal: number
}

export function ExpenseSummary({ byCategory, grandTotal }: ExpenseSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Total gastos</p>
        <p className="mt-1 text-2xl font-bold text-foreground">
          {formatCurrency(grandTotal)}
        </p>
      </div>
      {byCategory
        .filter((c) => Number(c.total) > 0)
        .map((cat) => (
          <div key={cat.category_name} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{cat.category_name}</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(Number(cat.total))}
            </p>
          </div>
        ))}
    </div>
  )
}
