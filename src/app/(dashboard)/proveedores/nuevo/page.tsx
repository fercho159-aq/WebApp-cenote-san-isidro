import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createSupplier } from '@/actions/suppliers'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { SupplierForm } from '@/components/suppliers/supplier-form'

export default function NuevoProveedorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo proveedor"
        description="Registrar un nuevo proveedor"
      >
        <Button variant="outline" asChild>
          <Link href="/proveedores">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <SupplierForm action={createSupplier} />
      </div>
    </div>
  )
}
