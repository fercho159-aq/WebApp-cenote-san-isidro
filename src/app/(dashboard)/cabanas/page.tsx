import Link from 'next/link'
import { BedDouble, Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { RoomCard } from '@/components/rooms/room-card'
import { getRooms } from '@/actions/rooms'

export default async function CabanasPage() {
  const rooms = await getRooms()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cabañas"
        description="Agrega, edita o elimina cabañas y gestiona sus categorías y tarifas. Cada cabaña se asigna a una categoría con precio base por noche."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/cabanas/categorias">
            <Tag className="h-4 w-4" />
            Categorias
          </Link>
        </Button>
        <Link
          href="/cabanas/nueva"
          className="inline-flex items-center gap-2 bg-[#0D7D6C] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#0a6959] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Cabana
        </Link>
      </PageHeader>

      {rooms.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="Sin cabanas"
          description="No se encontraron cabanas registradas en el sistema."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
