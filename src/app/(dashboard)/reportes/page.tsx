import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getOccupancyReport,
  getRevenueReport,
  getReservationReport,
  getGuestReport,
} from '@/actions/reports'
import { formatCurrency } from '@/lib/formatters'
import { RESERVATION_STATUSES, BOOKING_CHANNELS } from '@/lib/constants'
import { BarChart3, DollarSign, Users, BedDouble } from 'lucide-react'
import { ReportTabs } from './report-tabs'

export default function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; start?: string; end?: string }>
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Analiza ocupación, ingresos, reservaciones y huéspedes"
      />
      <Suspense fallback={<ReportsSkeleton />}>
        <ReportsContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  )
}

async function ReportsContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ tab?: string; start?: string; end?: string }>
}) {
  const searchParams = await searchParamsPromise
  const activeTab = searchParams.tab || 'ocupacion'

  // Default: last 30 days
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const startDate = searchParams.start || thirtyDaysAgo.toISOString().split('T')[0]
  const endDate = searchParams.end || today.toISOString().split('T')[0]

  const [occupancy, revenue, reservations, guests] = await Promise.all([
    activeTab === 'ocupacion' ? getOccupancyReport(startDate, endDate) : null,
    activeTab === 'ingresos' ? getRevenueReport(startDate, endDate) : null,
    activeTab === 'reservaciones' ? getReservationReport(startDate, endDate) : null,
    activeTab === 'huespedes' ? getGuestReport(startDate, endDate) : null,
  ])

  return (
    <ReportTabs
      activeTab={activeTab}
      startDate={startDate}
      endDate={endDate}
      occupancy={occupancy}
      revenue={revenue}
      reservations={reservations}
      guests={guests}
    />
  )
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-full bg-muted rounded-lg animate-pulse" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-muted rounded-xl animate-pulse" />
    </div>
  )
}
