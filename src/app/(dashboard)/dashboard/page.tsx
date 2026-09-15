import {
  PlaneLanding,
  PlaneTakeoff,
  BedDouble,
  DoorOpen,
  CalendarX2,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RecentReservations } from '@/components/dashboard/recent-reservations'
import { RoomStatusGrid } from '@/components/dashboard/room-status-grid'
import {
  getDashboardStats,
  getRecentReservations,
  getTodayMovements,
} from '@/actions/dashboard'
import { getRooms } from '@/actions/rooms'
import { formatCurrency } from '@/lib/formatters'
import { RESERVATION_STATUSES } from '@/lib/constants'
import type { ReservationStatus } from '@/types'

const holidays = [
  { month: 'Sep', day: '16', name: 'Día de la Independencia' },
  { month: 'Nov', day: '16', name: 'Día de la Revolución' },
  { month: 'Dic', day: '12', name: 'Día de la Virgen de Guadalupe' },
  { month: 'Dic', day: '25', name: 'Navidad' },
]

export default async function DashboardPage() {
  const [stats, reservations, movements, rooms] = await Promise.all([
    getDashboardStats(),
    getRecentReservations(),
    getTodayMovements(),
    getRooms(),
  ])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel principal</h1>
        <p className="text-sm text-muted-foreground">
          Vista general del cenote: ocupación actual, llegadas y salidas del día, ingresos recientes y estado de cada cabaña.
        </p>
      </div>

      {/* Welcome */}
      <div className="rounded-lg bg-primary/5 border border-primary/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">
          Hola Cenote San Isidro
        </h2>
        <p className="text-sm text-muted-foreground">
          Bienvenido a la información diaria de tu propiedad
        </p>
      </div>

      {/* Stats cards — 6 in a row like LobbyPMS */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard value={stats.arrivalsToday + stats.departuresToday} label="Reservas" sublabel="del día" />
        <StatCard value={0} label="Canceladas" sublabel="del día" />
        <StatCard value={stats.occupiedRooms > 0 ? Math.round((stats.occupiedRooms / 12) * 100) + '%' : '0%'} label="Ocupación" sublabel="del día" />
        <StatCard value={stats.arrivalsToday} label="Llegadas" sublabel="Hoy" />
        <StatCard value={stats.departuresToday} label="Salidas" sublabel="Hoy" />
        <StatCard value={stats.occupiedRooms} label="In house" sublabel="Reservas" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Movements of the day */}
        <div className="lg:col-span-2 space-y-6">
          {/* Arrivals & Departures */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Movimientos del día
              </CardTitle>
            </CardHeader>
            <CardContent>
              {movements.arrivals.length === 0 &&
              movements.departures.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay movimientos para hoy
                </p>
              ) : (
                <div className="space-y-2">
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
                              : 'Huésped'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Llegada &middot; {arrival.room?.name ?? 'Sin cabaña'}
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
                              : 'Huésped'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Salida &middot; {departure.room?.name ?? 'Sin cabaña'}
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

        {/* Right column — Holidays & Events */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Festivos y eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {holidays.map((h) => (
                  <div key={h.name} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-[10px] font-bold uppercase leading-none">{h.month}</span>
                      <span className="text-sm font-bold leading-tight">{h.day}</span>
                    </div>
                    <span className="text-sm text-foreground">{h.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Income summary card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Resumen financiero
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ingresos del día</span>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(stats.todayIncome)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cabañas sucias</span>
                  <span className="text-sm font-semibold text-foreground">{stats.dirtyRooms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ocupación</span>
                  <span className="text-sm font-semibold text-primary">
                    {stats.occupiedRooms > 0 ? Math.round((stats.occupiedRooms / 12) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, sublabel }: { value: string | number; label: string; sublabel: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-5 px-3 text-center">
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className="text-sm font-medium text-foreground mt-1">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </CardContent>
    </Card>
  )
}
