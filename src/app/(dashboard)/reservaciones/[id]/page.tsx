import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ReservationStatusBadge,
  PaymentStatusBadge,
} from '@/components/reservations/status-badge'
import { ReservationStatusActions } from '@/components/reservations/reservation-status-actions'
import { PaymentList } from '@/components/reservations/payment-list'
import { PaymentForm } from '@/components/reservations/payment-form'
import { ChargeForm } from '@/components/reservations/charge-form'
import { getReservationById } from '@/actions/reservations'
import {
  getPaymentsByReservation,
  getChargesByReservation,
} from '@/actions/payments'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters'
import { BOOKING_CHANNELS } from '@/lib/constants'
import type { ReservationStatus, PaymentStatus, BookingChannel } from '@/types'
import {
  ArrowLeft,
  CalendarDays,
  User,
  DollarSign,
  StickyNote,
  Home,
  Users,
  Hash,
  CreditCard,
  Receipt,
} from 'lucide-react'

export default async function ReservacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const reservation = await getReservationById(id)

  if (!reservation) {
    notFound()
  }

  const [payments, charges] = await Promise.all([
    getPaymentsByReservation(id),
    getChargesByReservation(id),
  ])

  const guest = reservation.guest
  const room = reservation.room

  const activePaymentsTotal = payments
    .filter((p) => !p.voided)
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const chargesTotal = charges.reduce((sum, c) => sum + Number(c.amount), 0)

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/reservaciones"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a reservaciones
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {reservation.reservation_number}
            </h1>
            <ReservationStatusBadge
              status={reservation.status as ReservationStatus}
            />
            <PaymentStatusBadge
              status={reservation.payment_status as PaymentStatus}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Creada el {formatDateTime(reservation.created_at)}
          </p>
        </div>

        {/* Status actions */}
        <ReservationStatusActions
          reservationId={reservation.id}
          currentStatus={reservation.status as ReservationStatus}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Datos de estancia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5 text-primary" />
              Datos de estancia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(reservation.check_in_date + 'T12:00:00')}
                </p>
                {reservation.actual_check_in && (
                  <p className="text-xs text-muted-foreground">
                    Real: {formatDateTime(reservation.actual_check_in)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Check-out</p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(reservation.check_out_date + 'T12:00:00')}
                </p>
                {reservation.actual_check_out && (
                  <p className="text-xs text-muted-foreground">
                    Real: {formatDateTime(reservation.actual_check_out)}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cabana</p>
                  <p className="text-sm font-medium text-foreground">
                    {room?.name || '-'}
                  </p>
                  {room?.category && (
                    <p className="text-xs text-muted-foreground">
                      {room.category.name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Noches</p>
                <p className="text-sm font-medium text-foreground">
                  {reservation.nights}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Adultos</p>
                  <p className="text-sm font-medium text-foreground">
                    {reservation.adults}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ninos</p>
                <p className="text-sm font-medium text-foreground">
                  {reservation.children}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Canal</p>
                  <p className="text-sm font-medium text-foreground">
                    {BOOKING_CHANNELS[
                      reservation.booking_channel as BookingChannel
                    ] || reservation.booking_channel}
                  </p>
                </div>
              </div>
            </div>

            {reservation.channel_reference && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Referencia del canal
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {reservation.channel_reference}
                  </p>
                </div>
              </>
            )}

            {reservation.cancelled_at && (
              <>
                <Separator />
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Cancelada el{' '}
                    {formatDateTime(reservation.cancelled_at)}
                  </p>
                  {reservation.cancellation_reason && (
                    <p className="mt-1 text-sm text-red-800 dark:text-red-300">
                      {reservation.cancellation_reason}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Huesped */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary" />
              Huesped
            </CardTitle>
          </CardHeader>
          <CardContent>
            {guest ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {guest.first_name[0]}
                    {guest.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {guest.first_name} {guest.last_name}
                    </p>
                    <Link
                      href={`/huespedes/${guest.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
                <Separator />
                {guest.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{guest.email}</p>
                  </div>
                )}
                {guest.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Telefono</p>
                    <p className="text-sm text-foreground">{guest.phone}</p>
                  </div>
                )}
                {guest.nationality && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Nacionalidad
                    </p>
                    <p className="text-sm text-foreground">
                      {guest.nationality}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Informacion del huesped no disponible.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desglose de tarifa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-primary" />
            Desglose de tarifa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tarifa por noche ({formatCurrency(reservation.nightly_rate)}) x{' '}
                {reservation.nights} noche{reservation.nights !== 1 ? 's' : ''}
              </span>
              <span className="text-foreground">
                {formatCurrency(reservation.nightly_rate * reservation.nights)}
              </span>
            </div>

            {reservation.discount_type && reservation.discount_value && (
              <div className="flex justify-between text-emerald-600">
                <span>
                  Descuento{' '}
                  {reservation.discount_type === 'percentage'
                    ? `(${reservation.discount_value}%)`
                    : '(fijo)'}
                </span>
                <span>
                  -
                  {formatCurrency(
                    reservation.nightly_rate * reservation.nights -
                      reservation.subtotal
                  )}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">
                {formatCurrency(reservation.subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                IVA ({Math.round(reservation.tax_rate * 100)}%)
              </span>
              <span className="text-foreground">
                {formatCurrency(reservation.tax_amount)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between text-base font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">
                {formatCurrency(reservation.total)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagado</span>
              <span className="font-medium text-emerald-600">
                {formatCurrency(reservation.amount_paid)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo pendiente</span>
              <span
                className={`font-semibold ${
                  reservation.balance_due > 0
                    ? 'text-red-600'
                    : 'text-emerald-600'
                }`}
              >
                {formatCurrency(reservation.balance_due)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {(reservation.notes || reservation.internal_notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <StickyNote className="h-5 w-5 text-primary" />
              Notas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {reservation.notes && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                    Notas de la reservacion
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {reservation.notes}
                  </p>
                </div>
              )}
              {reservation.internal_notes && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                    Notas internas
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">
                    {reservation.internal_notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-5 w-5 text-primary" />
            Pagos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumen de pagos */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(reservation.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pagado</p>
                <p className="text-lg font-semibold text-emerald-600">
                  {formatCurrency(activePaymentsTotal)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo pendiente</p>
                <p
                  className={`text-lg font-semibold ${
                    reservation.balance_due > 0
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {formatCurrency(reservation.balance_due)}
                </p>
              </div>
            </div>
          </div>

          {/* Lista de pagos */}
          <PaymentList payments={payments} />

          {/* Formulario de nuevo pago */}
          <Separator />
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Registrar nuevo pago
            </h3>
            <PaymentForm
              reservationId={reservation.id}
              balanceDue={reservation.balance_due}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cargos Extra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-5 w-5 text-primary" />
            Cargos Extra
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lista de cargos */}
          {charges.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">
                      Fecha
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground">
                      Descripcion
                    </th>
                    <th className="pb-2 font-medium text-muted-foreground">
                      Tipo
                    </th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {charges.map((charge) => (
                    <tr
                      key={charge.id}
                      className="border-b border-border/50"
                    >
                      <td className="py-3 text-muted-foreground">
                        {formatDateTime(charge.created_at)}
                      </td>
                      <td className="py-3 text-foreground">
                        {charge.description}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {charge.charge_type || '-'}
                      </td>
                      <td className="py-3 text-right font-medium text-foreground">
                        {formatCurrency(charge.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td
                      colSpan={3}
                      className="py-3 text-right font-semibold text-foreground"
                    >
                      Total cargos extra:
                    </td>
                    <td className="py-3 text-right font-semibold text-foreground">
                      {formatCurrency(chargesTotal)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No hay cargos extra registrados.
            </p>
          )}

          {/* Formulario de nuevo cargo */}
          <Separator />
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Agregar cargo extra
            </h3>
            <ChargeForm reservationId={reservation.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
