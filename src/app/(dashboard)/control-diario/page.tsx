import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDailyControl, getDailySummary } from '@/actions/daily-control'
import { formatCurrency } from '@/lib/formatters'
import { RESERVATION_STATUSES } from '@/lib/constants'
import type { Reservation, ReservationStatus } from '@/types'
import {
  PlaneLanding,
  PlaneTakeoff,
  BedDouble,
  DoorOpen,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import Link from 'next/link'
import { DailyDatePicker } from './date-picker'

export default function ControlDiarioPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<DailySkeleton />}>
        <DailyContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  )
}

async function DailyContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ date?: string }>
}) {
  const searchParams = await searchParamsPromise
  const date = searchParams.date || new Date().toISOString().split('T')[0]

  const [control, summary] = await Promise.all([
    getDailyControl(date),
    getDailySummary(date),
  ])

  const dateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <PageHeader
        title="Control diario"
        description={dateFormatted}
      >
        <DailyDatePicker currentDate={date} />
      </PageHeader>

      {/* Summary cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-5 px-3 text-center">
            <PlaneLanding className="h-5 w-5 text-emerald-600 mb-1" />
            <p className="text-3xl font-bold text-foreground">{control.arrivalsCount}</p>
            <p className="text-sm font-medium text-foreground">Llegadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-5 px-3 text-center">
            <PlaneTakeoff className="h-5 w-5 text-blue-600 mb-1" />
            <p className="text-3xl font-bold text-foreground">{control.departuresCount}</p>
            <p className="text-sm font-medium text-foreground">Salidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-5 px-3 text-center">
            <BedDouble className="h-5 w-5 text-primary mb-1" />
            <p className="text-3xl font-bold text-primary">{control.inHouseCount}</p>
            <p className="text-sm font-medium text-foreground">In house</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-5 px-3 text-center">
            <DoorOpen className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-3xl font-bold text-foreground">{control.availableRooms}</p>
            <p className="text-sm font-medium text-foreground">Disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pagos recibidos</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(summary.income)}</p>
                <p className="text-xs text-muted-foreground">{control.paymentsCount} pago{control.paymentsCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <ArrowUpCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gastos</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(summary.expenses)}</p>
                <p className="text-xs text-muted-foreground">Módulo en desarrollo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Neto del día</p>
                <p className={`text-xl font-bold ${summary.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.net)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arrivals and Departures lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Arrivals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <PlaneLanding className="h-4 w-4 text-emerald-600" />
              Llegadas ({control.arrivalsCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {control.arrivals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay llegadas programadas
              </p>
            ) : (
              <div className="space-y-2">
                {(control.arrivals as Reservation[]).map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/reservaciones/${res.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {res.guest
                          ? `${res.guest.first_name} ${res.guest.last_name}`
                          : 'Huésped'}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {res.room?.name ?? 'Sin cabaña'} &middot; {res.nights} noche{res.nights !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge
                      variant={res.status === 'checked_in' ? 'success' : 'warning'}
                    >
                      {RESERVATION_STATUSES[res.status as ReservationStatus]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Departures */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <PlaneTakeoff className="h-4 w-4 text-blue-600" />
              Salidas ({control.departuresCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {control.departures.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay salidas programadas
              </p>
            ) : (
              <div className="space-y-2">
                {(control.departures as Reservation[]).map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/reservaciones/${res.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {res.guest
                          ? `${res.guest.first_name} ${res.guest.last_name}`
                          : 'Huésped'}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {res.room?.name ?? 'Sin cabaña'}
                      </p>
                      {res.balance_due > 0 && (
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                          Saldo: {formatCurrency(res.balance_due)}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={res.status === 'checked_out' ? 'secondary' : 'success'}
                    >
                      {RESERVATION_STATUSES[res.status as ReservationStatus]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function DailySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
