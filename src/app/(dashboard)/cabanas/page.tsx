import { BedDouble } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { RoomCard } from '@/components/rooms/room-card'
import { getRooms } from '@/actions/rooms'

export default async function CabanasPage() {
  const rooms = await getRooms()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cabanas"
        description="Gestiona las 12 cabanas del cenote"
      />

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
