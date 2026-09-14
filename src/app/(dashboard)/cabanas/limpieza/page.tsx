import { PageHeader } from '@/components/shared/page-header'
import { CleaningBoard } from '@/components/rooms/cleaning-board'
import { getRooms } from '@/actions/rooms'

export default async function LimpiezaPage() {
  const rooms = await getRooms()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Housekeeping"
        description="Estado de limpieza de cabanas"
      />

      <CleaningBoard rooms={rooms} />
    </div>
  )
}
