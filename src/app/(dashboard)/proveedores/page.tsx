import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'
import { getSuppliers } from '@/actions/suppliers'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { SupplierSearch } from '@/components/suppliers/supplier-search'
import { SupplierTable } from '@/components/suppliers/supplier-table'

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const suppliers = await getSuppliers(q)

  return (
    <div className="space-y-6">
      <PageHeader title="Proveedores" description="Directorio de proveedores con datos de contacto, RFC y notas. Registra a quienes surten productos, servicios o materiales al cenote.">
        <Button asChild>
          <Link href="/proveedores/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo proveedor
          </Link>
        </Button>
      </PageHeader>

      <Suspense>
        <SupplierSearch />
      </Suspense>

      {suppliers.length > 0 ? (
        <SupplierTable suppliers={suppliers} />
      ) : (
        <EmptyState
          icon={Building2}
          title="No hay proveedores registrados"
          description={
            q
              ? 'No se encontraron proveedores con los criterios de busqueda.'
              : 'Agrega tu primer proveedor para comenzar a gestionar el directorio.'
          }
        >
          {!q && (
            <Button asChild>
              <Link href="/proveedores/nuevo">
                <Plus className="h-4 w-4" />
                Nuevo proveedor
              </Link>
            </Button>
          )}
        </EmptyState>
      )}
    </div>
  )
}
