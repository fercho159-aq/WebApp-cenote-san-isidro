import { PageHeader } from '@/components/shared/page-header'
import { ReservationForm } from '@/components/reservations/reservation-form'

export default async function NuevaReservacionPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string; checkIn?: string }>
}) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Nueva reservación"
        description="Selecciona fechas, cabaña disponible y datos del huésped para crear una nueva reservación. El sistema calcula automáticamente noches, impuestos y total."
      />
      <ReservationForm
        prefilledRoomId={params.room}
        prefilledCheckIn={params.checkIn}
      />
    </div>
  )
}
