import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createProduct, getProductCategories } from '@/actions/products'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/products/product-form'

export default async function NuevoProductoPage() {
  const categories = await getProductCategories()

  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo producto" description="Agrega un producto al catálogo de venta: nombre, categoría, precio, costo y código SKU opcional.">
        <Button variant="outline" asChild>
          <Link href="/productos">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <ProductForm categories={categories} action={createProduct} />
      </div>
    </div>
  )
}
