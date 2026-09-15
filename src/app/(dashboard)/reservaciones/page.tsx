import Link from 'next/link'
import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import {
  ReservationStatusBadge,
  PaymentStatusBadge,
} from '@/components/reservations/status-badge'
import { ReservationFilters } from '@/components/reservations/reservation-filters'
import { getReservations } from '@/actions/reservations'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Reservation, ReservationStatus, PaymentStatus } from '@/types'
import { Plus, BookOpen, Loader2 } from 'lucide-react'

export default async function ReservacionesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    search?: string
    startDate?: string
    endDate?: string
  }>
}) {
  const params = await searchParams

  return (
    <div className="space-y-6">
      <PageHeader title="Reservaciones" description="Consulta, crea y administra todas las reservaciones. Filtra por estado, fechas o nombre del huésped. Desde aquí puedes registrar pagos y cargos extras.">
        <Link href="/reservaciones/nueva">
          <Button>
            <Plus className="h-4 w-4" />
            Nueva reservacion
          </Button>
        </Link>
      </PageHeader>

      <Suspense fallback={<FiltersSkeleton />}>
        <ReservationFilters />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <ReservationsTable
          status={params.status}
          search={params.search}
          startDate={params.startDate}
          endDate={params.endDate}
        />
      </Suspense>
    </div>
  )
}

async function ReservationsTable({
  status,
  search,
  startDate,
  endDate,
}: {
  status?: string
  search?: string
  startDate?: string
  endDate?: string
}) {
  const reservations = await getReservations({
    status,
    search,
    startDate,
    endDate,
  })

  if (reservations.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No hay reservaciones"
        description="No se encontraron reservaciones con los filtros seleccionados."
      >
        <Link href="/reservaciones/nueva">
          <Button>
            <Plus className="h-4 w-4" />
            Nueva reservacion
          </Button>
        </Link>
      </EmptyState>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
              # Reservacion
            </th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
              Huesped
            </th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
              Cabana
            </th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
              Check-in
            </th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
              Check-out
            </th>
            <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
              Noches
            </th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
              Estado
            </th>
            <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
              Pago
            </th>
            <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation: Reservation) => (
            <tr
              key={reservation.id}
              className="border-b border-border transition-colors hover:bg-muted/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/reservaciones/${reservation.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {reservation.reservation_number}
                </Link>
              </td>
              <td className="px-4 py-3 text-foreground">
                {reservation.guest
                  ? `${reservation.guest.first_name} ${reservation.guest.last_name}`
                  : '-'}
              </td>
              <td className="px-4 py-3 text-foreground">
                {reservation.room?.name || '-'}
              </td>
              <td className="px-4 py-3 text-foreground">
                {formatDate(reservation.check_in_date + 'T12:00:00')}
              </td>
              <td className="px-4 py-3 text-foreground">
                {formatDate(reservation.check_out_date + 'T12:00:00')}
              </td>
              <td className="px-4 py-3 text-center text-foreground">
                {reservation.nights}
              </td>
              <td className="px-4 py-3">
                <ReservationStatusBadge
                  status={reservation.status as ReservationStatus}
                />
              </td>
              <td className="px-4 py-3">
                <PaymentStatusBadge
                  status={reservation.payment_status as PaymentStatus}
                />
              </td>
              <td className="px-4 py-3 text-right font-medium text-foreground">
                {formatCurrency(reservation.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FiltersSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-44 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
      <div className="h-10 w-36 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="flex h-96 items-center justify-center rounded-xl border border-border">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}
