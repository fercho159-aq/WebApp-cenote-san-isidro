import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSupplierById, updateSupplier } from '@/actions/suppliers'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { SupplierForm } from '@/components/suppliers/supplier-form'

export default async function EditarProveedorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supplier = await getSupplierById(id)

  if (!supplier) {
    notFound()
  }

  const updateSupplierWithId = async (formData: FormData) => {
    'use server'
    return updateSupplier(id, formData)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar proveedor"
        description={supplier.name}
      >
        <Button variant="outline" asChild>
          <Link href="/proveedores">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <SupplierForm supplier={supplier} action={updateSupplierWithId} />
      </div>
    </div>
  )
}
