import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  MapPin,
  Pencil,
  StickyNote,
  CalendarDays,
  User,
} from 'lucide-react'
import { getGuestById } from '@/actions/guests'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { RESERVATION_STATUSES } from '@/lib/constants'
import type { ReservationStatus } from '@/types'

const STATUS_VARIANT: Record<ReservationStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  pending: 'warning',
  confirmed: 'success',
  checked_in: 'default',
  checked_out: 'secondary',
  cancelled: 'destructive',
  no_show: 'destructive',
}

const ID_DOCUMENT_LABELS: Record<string, string> = {
  INE: 'INE',
  Pasaporte: 'Pasaporte',
  Licencia: 'Licencia',
  Otro: 'Otro',
}

export default async function GuestProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getGuestById(id)

  if (!data) {
    notFound()
  }

  const { guest, reservations } = data

  const lastVisit = reservations.length > 0 ? reservations[0].check_in_date : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${guest.first_name} ${guest.last_name}`}
        description="Perfil de huésped"
      >
        <Button variant="outline" asChild>
          <Link href="/huespedes">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Button asChild>
          <Link href={`/huespedes/${guest.id}/editar`}>
            <Pencil className="h-4 w-4" />
            Editar
          </Link>
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de estancias</p>
              <p className="text-2xl font-bold text-foreground">{guest.total_stays}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última visita</p>
              <p className="text-2xl font-bold text-foreground">
                {lastVisit ? formatDate(lastVisit) : 'Sin visitas'}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registrado</p>
              <p className="text-2xl font-bold text-foreground">
                {formatDate(guest.created_at)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium text-foreground">
                {guest.email ?? '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Teléfono</span>
              <span className="text-sm font-medium text-foreground">
                {guest.phone ?? '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Identificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tipo de documento</span>
              <span className="text-sm font-medium text-foreground">
                {guest.id_document_type
                  ? (ID_DOCUMENT_LABELS[guest.id_document_type] ?? guest.id_document_type)
                  : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Número</span>
              <span className="text-sm font-medium text-foreground">
                {guest.id_document_number ?? '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Nacionalidad</p>
                <p className="text-sm font-medium text-foreground">
                  {guest.nationality ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">País</p>
                <p className="text-sm font-medium text-foreground">
                  {guest.country ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="text-sm font-medium text-foreground">
                  {guest.state ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ciudad</p>
                <p className="text-sm font-medium text-foreground">
                  {guest.city ?? '-'}
                </p>
              </div>
            </div>
            {guest.address && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">Dirección</p>
                <p className="text-sm font-medium text-foreground">{guest.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {guest.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {guest.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reservation history */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de reservas</CardTitle>
        </CardHeader>
        <CardContent>
          {reservations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      No. Reserva
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Habitación
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Check-in
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Check-out
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {reservation.reservation_number}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {reservation.room?.name ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(reservation.check_in_date)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(reservation.check_out_date)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={STATUS_VARIANT[reservation.status] ?? 'secondary'}
                        >
                          {RESERVATION_STATUSES[reservation.status] ?? reservation.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatCurrency(reservation.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Este huésped no tiene reservas registradas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
