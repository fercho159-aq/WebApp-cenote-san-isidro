import { getActiveProducts, getProductCategories } from '@/actions/products'
import { getCheckedInReservations, getSales } from '@/actions/pos'
import { PosTerminal } from '@/components/pos/pos-terminal'

export default async function PosPage() {
  const [products, categories, reservations, recentSales] = await Promise.all([
    getActiveProducts(),
    getProductCategories(),
    getCheckedInReservations(),
    getSales({ status: 'completed' }),
  ])

  return (
    <PosTerminal
      products={products}
      categories={categories.filter((c) => c.is_active)}
      reservations={reservations}
      recentSales={recentSales}
    />
  )
}
