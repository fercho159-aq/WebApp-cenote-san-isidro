import {
  PlaneLanding,
  PlaneTakeoff,
  BedDouble,
  DoorOpen,
  DollarSign,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentReservations } from '@/components/dashboard/recent-reservations'
import { RoomStatusGrid } from '@/components/dashboard/room-status-grid'
import {
  getDashboardStats,
  getRecentReservations,
  getTodayMovements,
} from '@/actions/dashboard'
import { getRooms } from '@/actions/rooms'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { RESERVATION_STATUSES } from '@/lib/constants'
import type { ReservationStatus } from '@/types'

export default async function DashboardPage() {
  const [stats, reservations, movements, rooms] = await Promise.all([
    getDashboardStats(),
    getRecentReservations(),
    getTodayMovements(),
    getRooms(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Resumen general de Cenote San Isidro
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Llegadas hoy"
          value={stats.arrivalsToday}
          icon={PlaneLanding}
        />
        <StatsCard
          label="Salidas hoy"
          value={stats.departuresToday}
          icon={PlaneTakeoff}
        />
        <StatsCard
          label="Habitaciones ocupadas"
          value={stats.occupiedRooms}
          icon={BedDouble}
        />
        <StatsCard
          label="Habitaciones disponibles"
          value={stats.availableRooms}
          icon={DoorOpen}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatsCard
          label="Ingresos del dia"
          value={formatCurrency(stats.todayIncome)}
          icon={DollarSign}
        />
        <StatsCard
          label="Cabanas sucias"
          value={stats.dirtyRooms}
          icon={Sparkles}
          description={
            stats.dirtyRooms > 0
              ? 'Requieren limpieza'
              : 'Todas las cabanas estan limpias'
          }
        />
      </div>

      {/* Movements of the day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimientos del dia</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.arrivals.length === 0 &&
          movements.departures.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay movimientos para hoy
            </p>
          ) : (
            <div className="space-y-3">
              {movements.arrivals.map((arrival) => (
                <div
                  key={`arrival-${arrival.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <PlaneLanding className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {arrival.guest
                          ? `${arrival.guest.first_name} ${arrival.guest.last_name}`
                          : 'Huesped'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Llegada &middot; {arrival.room?.name ?? 'Sin cabana'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">
                    {RESERVATION_STATUSES[arrival.status as ReservationStatus]}
                  </Badge>
                </div>
              ))}
              {movements.departures.map((departure) => (
                <div
                  key={`departure-${departure.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <PlaneTakeoff className="h-4 w-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {departure.guest
                          ? `${departure.guest.first_name} ${departure.guest.last_name}`
                          : 'Huesped'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Salida &middot; {departure.room?.name ?? 'Sin cabana'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {RESERVATION_STATUSES[departure.status as ReservationStatus]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent reservations */}
      <RecentReservations reservations={reservations as any} />

      {/* Room status grid */}
      <RoomStatusGrid rooms={rooms} />
    </div>
  )
}
