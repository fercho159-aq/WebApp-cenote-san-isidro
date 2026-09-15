import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDb } from '@/lib/db'
import { formatCurrency } from '@/lib/formatters'
import { BOOKING_CHANNELS } from '@/lib/constants'
import {
  BedDouble,
  DollarSign,
  Moon,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'

async function getStatistics() {
  const sql = getDb()

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

  try {
    const [
      totalRoomsResult,
      thisMonthOcc,
      lastMonthOcc,
      thisMonthRevenue,
      lastMonthRevenue,
      thisMonthAvgRate,
      lastMonthAvgRate,
      thisMonthAvgStay,
      lastMonthAvgStay,
      topRooms,
      channelDist,
    ] = await Promise.all([
      // Total rooms
      sql`SELECT COUNT(*)::int as count FROM rooms`,

      // This month occupancy: count distinct room-days with active reservations
      sql`
        WITH month_days AS (
          SELECT generate_series(${thisMonthStart}::date, ${thisMonthEnd}::date, '1 day'::interval)::date AS day
        )
        SELECT COUNT(DISTINCT (r.room_id, md.day))::int as occupied_days
        FROM month_days md
        JOIN reservations r ON r.check_in_date <= md.day AND r.check_out_date > md.day
        WHERE r.status IN ('checked_in', 'checked_out', 'confirmed')
      `,

      // Last month occupancy
      sql`
        WITH month_days AS (
          SELECT generate_series(${lastMonthStart}::date, ${lastMonthEnd}::date, '1 day'::interval)::date AS day
        )
        SELECT COUNT(DISTINCT (r.room_id, md.day))::int as occupied_days
        FROM month_days md
        JOIN reservations r ON r.check_in_date <= md.day AND r.check_out_date > md.day
        WHERE r.status IN ('checked_in', 'checked_out', 'confirmed')
      `,

      // This month revenue
      sql`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payments
        WHERE created_at >= ${thisMonthStart + 'T00:00:00'}
          AND created_at <= ${thisMonthEnd + 'T23:59:59.999'}
          AND voided = false
      `,

      // Last month revenue
      sql`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payments
        WHERE created_at >= ${lastMonthStart + 'T00:00:00'}
          AND created_at <= ${lastMonthEnd + 'T23:59:59.999'}
          AND voided = false
      `,

      // This month avg nightly rate
      sql`
        SELECT COALESCE(AVG(nightly_rate), 0) as avg_rate
        FROM reservations
        WHERE check_in_date >= ${thisMonthStart}
          AND check_in_date <= ${thisMonthEnd}
          AND status NOT IN ('cancelled', 'no_show')
      `,

      // Last month avg nightly rate
      sql`
        SELECT COALESCE(AVG(nightly_rate), 0) as avg_rate
        FROM reservations
        WHERE check_in_date >= ${lastMonthStart}
          AND check_in_date <= ${lastMonthEnd}
          AND status NOT IN ('cancelled', 'no_show')
      `,

      // This month avg stay
      sql`
        SELECT COALESCE(AVG(nights), 0) as avg_nights
        FROM reservations
        WHERE check_in_date >= ${thisMonthStart}
          AND check_in_date <= ${thisMonthEnd}
          AND status NOT IN ('cancelled', 'no_show')
      `,

      // Last month avg stay
      sql`
        SELECT COALESCE(AVG(nights), 0) as avg_nights
        FROM reservations
        WHERE check_in_date >= ${lastMonthStart}
          AND check_in_date <= ${lastMonthEnd}
          AND status NOT IN ('cancelled', 'no_show')
      `,

      // Top rooms by revenue (this month)
      sql`
        SELECT rm.name, COALESCE(SUM(r.total), 0) as revenue, COUNT(r.id)::int as reservations
        FROM rooms rm
        LEFT JOIN reservations r ON r.room_id = rm.id
          AND r.check_in_date >= ${thisMonthStart}
          AND r.check_in_date <= ${thisMonthEnd}
          AND r.status NOT IN ('cancelled', 'no_show')
        GROUP BY rm.id, rm.name
        ORDER BY revenue DESC
        LIMIT 5
      `,

      // Channel distribution (this month)
      sql`
        SELECT booking_channel, COUNT(*)::int as count
        FROM reservations
        WHERE check_in_date >= ${thisMonthStart}
          AND check_in_date <= ${thisMonthEnd}
          AND status NOT IN ('cancelled', 'no_show')
        GROUP BY booking_channel
        ORDER BY count DESC
      `,
    ])

    const totalRooms = totalRoomsResult[0].count || 1
    const daysInThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysInLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()

    const thisMonthOccPercent = Math.round(
      ((thisMonthOcc[0].occupied_days as number) / (totalRooms * daysInThisMonth)) * 100
    )
    const lastMonthOccPercent = Math.round(
      ((lastMonthOcc[0].occupied_days as number) / (totalRooms * daysInLastMonth)) * 100
    )

    return {
      thisMonth: {
        occupancy: thisMonthOccPercent,
        revenue: Number(thisMonthRevenue[0].total),
        avgRate: Math.round(Number(thisMonthAvgRate[0].avg_rate)),
        avgStay: Math.round(Number(thisMonthAvgStay[0].avg_nights) * 10) / 10,
      },
      lastMonth: {
        occupancy: lastMonthOccPercent,
        revenue: Number(lastMonthRevenue[0].total),
        avgRate: Math.round(Number(lastMonthAvgRate[0].avg_rate)),
        avgStay: Math.round(Number(lastMonthAvgStay[0].avg_nights) * 10) / 10,
      },
      topRooms: topRooms.map((r: Record<string, unknown>) => ({
        name: r.name as string,
        revenue: Number(r.revenue),
        reservations: r.reservations as number,
      })),
      channelDist: channelDist.map((c: Record<string, unknown>) => ({
        channel: c.booking_channel as string,
        count: c.count as number,
      })),
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return {
      thisMonth: { occupancy: 0, revenue: 0, avgRate: 0, avgStay: 0 },
      lastMonth: { occupancy: 0, revenue: 0, avgRate: 0, avgStay: 0 },
      topRooms: [],
      channelDist: [],
    }
  }
}

function TrendIcon({ current, previous }: { current: number; previous: number }) {
  if (current > previous) return <TrendingUp className="h-4 w-4 text-emerald-500" />
  if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
  return <Minus className="h-4 w-4 text-muted-foreground" />
}

function trendText(current: number, previous: number) {
  if (previous === 0) return 'Sin datos previos'
  const diff = ((current - previous) / previous) * 100
  const sign = diff > 0 ? '+' : ''
  return `${sign}${Math.round(diff)}% vs mes anterior`
}

const CHANNEL_COLORS: Record<string, string> = {
  direct: 'bg-[#0D7D6C]',
  booking_engine: 'bg-blue-500',
  airbnb: 'bg-rose-500',
  booking_com: 'bg-indigo-500',
  expedia: 'bg-yellow-500',
  phone: 'bg-emerald-500',
  walk_in: 'bg-purple-500',
  other: 'bg-slate-500',
}

export default async function EstadisticasPage() {
  const stats = await getStatistics()

  const monthName = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  const totalChannelCount = stats.channelDist.reduce((sum, c) => sum + c.count, 0) || 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estadísticas"
        description={`Indicadores clave del negocio: ocupación, ingresos, tarifa promedio y estancia media. Compara el rendimiento mes a mes. Resumen de ${monthName}.`}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ocupación este mes</p>
                <p className="text-3xl font-bold text-primary">{stats.thisMonth.occupancy}%</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon current={stats.thisMonth.occupancy} previous={stats.lastMonth.occupancy} />
                  {trendText(stats.thisMonth.occupancy, stats.lastMonth.occupancy)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BedDouble className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ingresos este mes</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.thisMonth.revenue)}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon current={stats.thisMonth.revenue} previous={stats.lastMonth.revenue} />
                  {trendText(stats.thisMonth.revenue, stats.lastMonth.revenue)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tarifa promedio</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.thisMonth.avgRate)}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon current={stats.thisMonth.avgRate} previous={stats.lastMonth.avgRate} />
                  {trendText(stats.thisMonth.avgRate, stats.lastMonth.avgRate)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Moon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estancia promedio</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.thisMonth.avgStay} <span className="text-base font-normal">noches</span>
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon current={stats.thisMonth.avgStay} previous={stats.lastMonth.avgStay} />
                  {trendText(stats.thisMonth.avgStay, stats.lastMonth.avgStay)}
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Comparación mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Métrica</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Este mes</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Mes anterior</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Cambio</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 text-foreground">Ocupación</td>
                  <td className="py-3 text-right font-medium text-foreground">{stats.thisMonth.occupancy}%</td>
                  <td className="py-3 text-right text-muted-foreground">{stats.lastMonth.occupancy}%</td>
                  <td className="py-3 text-right">
                    <ComparisonBadge current={stats.thisMonth.occupancy} previous={stats.lastMonth.occupancy} suffix="pp" />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 text-foreground">Ingresos</td>
                  <td className="py-3 text-right font-medium text-foreground">{formatCurrency(stats.thisMonth.revenue)}</td>
                  <td className="py-3 text-right text-muted-foreground">{formatCurrency(stats.lastMonth.revenue)}</td>
                  <td className="py-3 text-right">
                    <ComparisonBadge current={stats.thisMonth.revenue} previous={stats.lastMonth.revenue} percentage />
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 text-foreground">Tarifa promedio</td>
                  <td className="py-3 text-right font-medium text-foreground">{formatCurrency(stats.thisMonth.avgRate)}</td>
                  <td className="py-3 text-right text-muted-foreground">{formatCurrency(stats.lastMonth.avgRate)}</td>
                  <td className="py-3 text-right">
                    <ComparisonBadge current={stats.thisMonth.avgRate} previous={stats.lastMonth.avgRate} percentage />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-foreground">Estancia promedio</td>
                  <td className="py-3 text-right font-medium text-foreground">{stats.thisMonth.avgStay} noches</td>
                  <td className="py-3 text-right text-muted-foreground">{stats.lastMonth.avgStay} noches</td>
                  <td className="py-3 text-right">
                    <ComparisonBadge current={stats.thisMonth.avgStay} previous={stats.lastMonth.avgStay} percentage />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top rooms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Top cabañas por ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topRooms.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin datos este mes</p>
            ) : (
              <div className="space-y-3">
                {stats.topRooms.map((room, i) => {
                  const maxRevenue = stats.topRooms[0].revenue || 1
                  return (
                    <div key={room.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          <span className="text-muted-foreground mr-2">{i + 1}.</span>
                          {room.name}
                        </span>
                        <span className="font-medium text-primary">{formatCurrency(room.revenue)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${(room.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{room.reservations} reservación{room.reservations !== 1 ? 'es' : ''}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Distribución por canal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.channelDist.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin datos este mes</p>
            ) : (
              <div className="space-y-4">
                {/* Stacked bar */}
                <div className="flex h-8 w-full overflow-hidden rounded-full">
                  {stats.channelDist.map((ch) => (
                    <div
                      key={ch.channel}
                      className={`${CHANNEL_COLORS[ch.channel] || 'bg-slate-400'}`}
                      style={{ width: `${(ch.count / totalChannelCount) * 100}%` }}
                      title={`${(BOOKING_CHANNELS as Record<string, string>)[ch.channel] || ch.channel}: ${ch.count}`}
                    />
                  ))}
                </div>
                {/* Legend */}
                <div className="space-y-2">
                  {stats.channelDist.map((ch) => (
                    <div key={ch.channel} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${CHANNEL_COLORS[ch.channel] || 'bg-slate-400'}`} />
                        <span className="text-foreground">
                          {(BOOKING_CHANNELS as Record<string, string>)[ch.channel] || ch.channel}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {ch.count} ({Math.round((ch.count / totalChannelCount) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ComparisonBadge({
  current,
  previous,
  percentage,
  suffix,
}: {
  current: number
  previous: number
  percentage?: boolean
  suffix?: string
}) {
  if (previous === 0 && current === 0) {
    return <span className="text-xs text-muted-foreground">-</span>
  }

  let diff: number
  let label: string

  if (percentage && previous > 0) {
    diff = ((current - previous) / previous) * 100
    label = `${diff > 0 ? '+' : ''}${Math.round(diff)}%`
  } else {
    diff = current - previous
    label = `${diff > 0 ? '+' : ''}${Math.round(diff * 10) / 10}${suffix ? ` ${suffix}` : ''}`
  }

  const color =
    diff > 0
      ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400'
      : diff < 0
        ? 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
        : 'text-muted-foreground bg-muted'

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
