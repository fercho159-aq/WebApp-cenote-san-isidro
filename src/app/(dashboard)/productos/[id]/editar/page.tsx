import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getProductById, getProductCategories, updateProduct } from '@/actions/products'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/products/product-form'

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    getProductById(id),
    getProductCategories(),
  ])

  if (!product) {
    notFound()
  }

  const updateProductWithId = async (formData: FormData) => {
    'use server'
    return updateProduct(id, formData)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar producto"
        description={product.name}
      >
        <Button variant="outline" asChild>
          <Link href="/productos">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <ProductForm
          product={product}
          categories={categories}
          action={updateProductWithId}
        />
      </div>
    </div>
  )
}
