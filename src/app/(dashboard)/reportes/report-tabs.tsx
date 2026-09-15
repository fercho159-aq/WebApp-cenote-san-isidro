'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, DollarSign, Users, BedDouble, Search } from 'lucide-react'

const RESERVATION_STATUSES: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  checked_in: 'Check-in',
  checked_out: 'Check-out',
  cancelled: 'Cancelada',
  no_show: 'No show',
}

const BOOKING_CHANNELS: Record<string, string> = {
  direct: 'Directo',
  booking_engine: 'Booking Engine',
  airbnb: 'Airbnb',
  booking_com: 'Booking.com',
  expedia: 'Expedia',
  phone: 'Teléfono',
  walk_in: 'Walk-in',
  other: 'Otro',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-500',
  checked_in: 'bg-blue-500',
  checked_out: 'bg-slate-500',
  cancelled: 'bg-red-500',
  no_show: 'bg-orange-500',
}

const CHANNEL_COLORS: Record<string, string> = {
  direct: 'bg-primary',
  booking_engine: 'bg-blue-500',
  airbnb: 'bg-rose-500',
  booking_com: 'bg-indigo-500',
  expedia: 'bg-yellow-500',
  phone: 'bg-emerald-500',
  walk_in: 'bg-purple-500',
  other: 'bg-slate-500',
}

function formatMXN(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

interface OccupancyData {
  days: { date: string; occupiedRooms: number; totalRooms: number; occupancyPercent: number }[]
  totalRooms: number
  avgOccupancy: number
  peakDay: { date: string; occupancyPercent: number } | null
}

interface RevenueData {
  roomRevenue: number
  roomCollected: number
  packageRevenue: number
  totalPayments: number
  dailyPayments: { date: string; total: number }[]
}

interface ReservationData {
  total: number
  byStatus: { status: string; count: number }[]
  byChannel: { channel: string; count: number }[]
  avgNights: number
  avgRate: number
}

interface GuestData {
  newGuests: number
  returningGuests: number
  topGuests: { id: string; name: string; totalRevenue: number; reservationCount: number }[]
}

interface ReportTabsProps {
  activeTab: string
  startDate: string
  endDate: string
  occupancy: OccupancyData | null
  revenue: RevenueData | null
  reservations: ReservationData | null
  guests: GuestData | null
}

const tabs = [
  { id: 'ocupacion', label: 'Ocupación', icon: BedDouble },
  { id: 'ingresos', label: 'Ingresos', icon: DollarSign },
  { id: 'reservaciones', label: 'Reservaciones', icon: BarChart3 },
  { id: 'huespedes', label: 'Huéspedes', icon: Users },
]

export function ReportTabs({
  activeTab,
  startDate,
  endDate,
  occupancy,
  revenue,
  reservations,
  guests,
}: ReportTabsProps) {
  const router = useRouter()
  const [start, setStart] = useState(startDate)
  const [end, setEnd] = useState(endDate)

  function navigate(tab: string, s?: string, e?: string) {
    const params = new URLSearchParams()
    params.set('tab', tab)
    params.set('start', s || start)
    params.set('end', e || end)
    router.push(`/reportes?${params.toString()}`)
  }

  function handleFilter() {
    navigate(activeTab, start, end)
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Date range filter */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Desde</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Hasta</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
          />
        </div>
        <Button onClick={handleFilter} size="sm">
          <Search className="h-4 w-4" />
          Filtrar
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'ocupacion' && occupancy && <OccupancyTab data={occupancy} />}
      {activeTab === 'ingresos' && revenue && <RevenueTab data={revenue} />}
      {activeTab === 'reservaciones' && reservations && <ReservationsTab data={reservations} />}
      {activeTab === 'huespedes' && guests && <GuestsTab data={guests} />}
    </div>
  )
}

function OccupancyTab({ data }: { data: OccupancyData }) {
  const maxOccupancy = Math.max(...data.days.map((d) => d.occupancyPercent), 1)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Ocupación promedio</p>
            <p className="text-3xl font-bold text-primary">{data.avgOccupancy}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total de cabañas</p>
            <p className="text-3xl font-bold text-foreground">{data.totalRooms}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Día pico</p>
            {data.peakDay ? (
              <>
                <p className="text-3xl font-bold text-foreground">{data.peakDay.occupancyPercent}%</p>
                <p className="text-xs text-muted-foreground">{formatDateShort(data.peakDay.date)}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Ocupación diaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.days.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin datos para el periodo seleccionado</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: 200 }}>
                {data.days.map((day) => (
                  <div key={day.date} className="flex flex-1 min-w-[20px] max-w-[40px] flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{day.occupancyPercent}%</span>
                    <div className="w-full rounded-t" style={{ height: Math.max((day.occupancyPercent / 100) * 150, 2), backgroundColor: day.occupancyPercent >= 80 ? '#0D7D6C' : day.occupancyPercent >= 50 ? '#0D7D6C99' : '#0D7D6C44' }} />
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{formatDateShort(day.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RevenueTab({ data }: { data: RevenueData }) {
  const maxPayment = Math.max(...data.dailyPayments.map((d) => d.total), 1)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Ingresos habitaciones</p>
            <p className="text-2xl font-bold text-primary">{formatMXN(data.roomRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Cobrado habitaciones</p>
            <p className="text-2xl font-bold text-foreground">{formatMXN(data.roomCollected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Ingresos paquetes</p>
            <p className="text-2xl font-bold text-foreground">{formatMXN(data.packageRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total pagos recibidos</p>
            <p className="text-2xl font-bold text-emerald-600">{formatMXN(data.totalPayments)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily payments chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Pagos diarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.dailyPayments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin datos para el periodo seleccionado</p>
          ) : (
            <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: 200 }}>
              {data.dailyPayments.map((day) => (
                <div key={day.date} className="flex flex-1 min-w-[20px] max-w-[40px] flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    {day.total > 0 ? formatMXN(day.total) : ''}
                  </span>
                  <div
                    className="w-full rounded-t bg-primary"
                    style={{ height: Math.max((day.total / maxPayment) * 150, day.total > 0 ? 4 : 1) }}
                  />
                  <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                    {formatDateShort(day.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ReservationsTab({ data }: { data: ReservationData }) {
  const maxStatusCount = Math.max(...data.byStatus.map((s) => s.count), 1)
  const maxChannelCount = Math.max(...data.byChannel.map((c) => c.count), 1)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total reservaciones</p>
            <p className="text-3xl font-bold text-primary">{data.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Estancia promedio</p>
            <p className="text-3xl font-bold text-foreground">{data.avgNights} <span className="text-base font-normal">noches</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Tarifa promedio</p>
            <p className="text-2xl font-bold text-foreground">{formatMXN(data.avgRate)}</p>
            <p className="text-xs text-muted-foreground">por noche</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Por estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.byStatus.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {data.byStatus.map((item) => (
                  <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {RESERVATION_STATUSES[item.status] || item.status}
                      </span>
                      <span className="font-medium text-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${STATUS_COLORS[item.status] || 'bg-slate-400'}`}
                        style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* By channel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Por canal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.byChannel.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {data.byChannel.map((item) => (
                  <div key={item.channel} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">
                        {BOOKING_CHANNELS[item.channel] || item.channel}
                      </span>
                      <span className="font-medium text-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${CHANNEL_COLORS[item.channel] || 'bg-slate-400'}`}
                        style={{ width: `${(item.count / maxChannelCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GuestsTab({ data }: { data: GuestData }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Huéspedes nuevos</p>
            <p className="text-3xl font-bold text-primary">{data.newGuests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Huéspedes recurrentes</p>
            <p className="text-3xl font-bold text-foreground">{data.returningGuests}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top guests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Top huéspedes por ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topGuests.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Sin datos para el periodo seleccionado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">#</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">Huésped</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Reservaciones</th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topGuests.map((guest, index) => (
                    <tr key={guest.id} className="border-b border-border last:border-0">
                      <td className="py-2 text-muted-foreground">{index + 1}</td>
                      <td className="py-2 font-medium text-foreground">{guest.name}</td>
                      <td className="py-2 text-right text-foreground">{guest.reservationCount}</td>
                      <td className="py-2 text-right font-medium text-primary">{formatMXN(guest.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
