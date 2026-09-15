import { PageHeader } from '@/components/shared/page-header'
import { ReservationCalendar } from '@/components/reservations/reservation-calendar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, List } from 'lucide-react'

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario de reservaciones"
        description="Vista mensual de ocupación: cada fila es una cabaña y cada bloque de color es una reservación. Haz clic en un espacio vacío para reservar."
      >
        <Link href="/reservaciones">
          <Button variant="outline" size="sm">
            <List className="h-4 w-4" />
            Lista
          </Button>
        </Link>
        <Link href="/reservaciones/nueva">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Nueva reservacion
          </Button>
        </Link>
      </PageHeader>

      <ReservationCalendar />
    </div>
  )
}
