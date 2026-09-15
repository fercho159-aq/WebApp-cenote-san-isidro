import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { getDepartures } from '@/actions/reservations'
import { formatCurrency } from '@/lib/formatters'
import type { Reservation } from '@/types'
import { CalendarCheck, LogOut as LogOutIcon } from 'lucide-react'
import Link from 'next/link'
import { DepartureCheckOutButton } from './check-out-button'

export default async function SalidasPage() {
  const today = new Date().toISOString().split('T')[0]
  const departures = await getDepartures(today)

  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salidas de hoy"
        description={`Huéspedes que salen hoy (${todayFormatted}). Verifica pagos pendientes antes de realizar el check-out.`}
      >
        <Link href="/reservaciones/calendario">
          <Button variant="outline" size="sm">
            <CalendarCheck className="h-4 w-4" />
            Calendario
          </Button>
        </Link>
      </PageHeader>

      {departures.length === 0 ? (
        <EmptyState
          icon={LogOutIcon}
          title="Sin salidas hoy"
          description="No hay reservaciones con check-out programado para hoy."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {departures.length} salida{departures.length !== 1 ? 's' : ''}{' '}
            programada{departures.length !== 1 ? 's' : ''}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departures.map((reservation: Reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link
                        href={`/reservaciones/${reservation.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {reservation.reservation_number}
                      </Link>
                      <p className="text-base font-semibold text-foreground">
                        {reservation.guest
                          ? `${reservation.guest.first_name} ${reservation.guest.last_name}`
                          : 'Huesped'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.room?.name || 'Sin cabana'}
                      </p>

                      {/* Balance warning */}
                      {reservation.balance_due > 0 && (
                        <div className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                          Saldo pendiente:{' '}
                          {formatCurrency(reservation.balance_due)}
                        </div>
                      )}

                      {reservation.balance_due <= 0 && (
                        <div className="mt-2 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                          Pagada
                        </div>
                      )}
                    </div>

                    <DepartureCheckOutButton
                      reservationId={reservation.id}
                      hasBalance={reservation.balance_due > 0}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
