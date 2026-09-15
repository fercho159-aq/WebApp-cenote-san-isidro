import { PageHeader } from '@/components/shared/page-header'
import { CleaningBoard } from '@/components/rooms/cleaning-board'
import { getRooms } from '@/actions/rooms'

export default async function LimpiezaPage() {
  const rooms = await getRooms()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Housekeeping"
        description="Tablero de limpieza: marca cada cabaña como limpia, en proceso o pendiente. Útil para coordinar al personal de limpieza entre check-outs y check-ins."
      />

      <CleaningBoard rooms={rooms} />
    </div>
  )
}
