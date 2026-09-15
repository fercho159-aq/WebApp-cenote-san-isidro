import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { getGuests } from '@/actions/guests'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { GuestSearch } from '@/components/guests/guest-search'
import { GuestTable } from '@/components/guests/guest-table'

export default async function HuespedesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const guests = await getGuests(q)

  return (
    <div className="space-y-6">
      <PageHeader title="Huéspedes" description="Directorio de todos los huéspedes que han reservado. Busca por nombre, correo o teléfono y consulta su historial de estancias.">
        <Button asChild>
          <Link href="/huespedes/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo huésped
          </Link>
        </Button>
      </PageHeader>

      <Suspense>
        <GuestSearch />
      </Suspense>

      {guests.length > 0 ? (
        <GuestTable guests={guests} />
      ) : (
        <EmptyState
          icon={Users}
          title="No hay huéspedes registrados"
          description={
            q
              ? 'No se encontraron huéspedes con los criterios de búsqueda.'
              : 'Agrega tu primer huésped para comenzar a gestionar el directorio.'
          }
        >
          {!q && (
            <Button asChild>
              <Link href="/huespedes/nuevo">
                <Plus className="h-4 w-4" />
                Nuevo huésped
              </Link>
            </Button>
          )}
        </EmptyState>
      )}
    </div>
  )
}
