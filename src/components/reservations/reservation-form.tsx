'use client'

import { useState, useEffect, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createReservation, getAvailableRooms } from '@/actions/reservations'
import { getGuests } from '@/actions/guests'
import { BOOKING_CHANNELS, TAX_RATE } from '@/lib/constants'
import { formatCurrency } from '@/lib/formatters'
import type { Room, Guest } from '@/types'
import {
  CalendarDays,
  Home,
  User,
  FileText,
  DollarSign,
  StickyNote,
  Loader2,
  Search,
  Check,
} from 'lucide-react'

interface ReservationFormProps {
  prefilledRoomId?: string
  prefilledCheckIn?: string
}

export function ReservationForm({
  prefilledRoomId,
  prefilledCheckIn,
}: ReservationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [checkInDate, setCheckInDate] = useState(prefilledCheckIn || '')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState(prefilledRoomId || '')
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [bookingChannel, setBookingChannel] = useState('direct')
  const [channelReference, setChannelReference] = useState('')
  const [nightlyRate, setNightlyRate] = useState(0)
  const [discountType, setDiscountType] = useState('none')
  const [discountValue, setDiscountValue] = useState(0)
  const [notes, setNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  // Data loading state
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestSearch, setGuestSearch] = useState('')
  const [loadingGuests, setLoadingGuests] = useState(false)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0
    const start = new Date(checkInDate)
    const end = new Date(checkOutDate)
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diff > 0 ? diff : 0
  }, [checkInDate, checkOutDate])

  // Calculate tariff
  const tariff = useMemo(() => {
    const gross = nightlyRate * nights
    let subtotal = gross

    if (discountType === 'percentage' && discountValue > 0) {
      subtotal = gross - gross * (discountValue / 100)
    } else if (discountType === 'fixed' && discountValue > 0) {
      subtotal = gross - discountValue
    }

    if (subtotal < 0) subtotal = 0

    const taxAmount = subtotal * TAX_RATE
    const total = subtotal + taxAmount

    return { gross, subtotal, taxAmount, total }
  }, [nightlyRate, nights, discountType, discountValue])

  // Fetch available rooms when dates change
  useEffect(() => {
    if (!checkInDate || !checkOutDate || nights <= 0) {
      setAvailableRooms([])
      return
    }

    setLoadingRooms(true)
    getAvailableRooms(checkInDate, checkOutDate)
      .then((rooms) => {
        setAvailableRooms(rooms)
        // If prefilled room is available, keep it
        if (prefilledRoomId && rooms.some((r) => r.id === prefilledRoomId)) {
          setSelectedRoomId(prefilledRoomId)
          const room = rooms.find((r) => r.id === prefilledRoomId)
          if (room?.category?.base_price) {
            setNightlyRate(room.category.base_price)
          }
        }
      })
      .finally(() => setLoadingRooms(false))
  }, [checkInDate, checkOutDate, nights, prefilledRoomId])

  // Fetch guests on search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (guestSearch.length >= 2) {
        setLoadingGuests(true)
        getGuests(guestSearch)
          .then((data) => {
            setGuests(data)
            setShowGuestDropdown(true)
          })
          .finally(() => setLoadingGuests(false))
      } else {
        setGuests([])
        setShowGuestDropdown(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [guestSearch])

  // When room is selected, update nightly rate
  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId)
    const room = availableRooms.find((r) => r.id === roomId)
    if (room?.category?.base_price) {
      setNightlyRate(room.category.base_price)
    }
  }

  // When guest is selected
  const selectedGuest = useMemo(() => {
    if (!selectedGuestId) return null
    return guests.find((g) => g.id === selectedGuestId) || null
  }, [selectedGuestId, guests])

  const handleSubmit = (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createReservation(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Hidden form fields for server action */}
      <input type="hidden" name="room_id" value={selectedRoomId} />
      <input type="hidden" name="guest_id" value={selectedGuestId} />
      <input type="hidden" name="nightly_rate" value={nightlyRate} />
      <input type="hidden" name="discount_type" value={discountType} />
      <input type="hidden" name="discount_value" value={discountValue} />

      {/* 1. Fechas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5 text-primary" />
            Fechas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="check_in_date">Fecha de check-in</Label>
              <Input
                id="check_in_date"
                name="check_in_date"
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check_out_date">Fecha de check-out</Label>
              <Input
                id="check_out_date"
                name="check_out_date"
                type="date"
                required
                value={checkOutDate}
                min={checkInDate || undefined}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Noches</Label>
              <div className="flex h-10 items-center rounded-lg border border-border bg-muted px-3 text-sm font-semibold">
                {nights > 0 ? `${nights} noche${nights !== 1 ? 's' : ''}` : '-'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Cabana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Home className="h-5 w-5 text-primary" />
            Cabana
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!checkInDate || !checkOutDate || nights <= 0 ? (
            <p className="text-sm text-muted-foreground">
              Selecciona las fechas de estancia para ver las cabanas disponibles.
            </p>
          ) : loadingRooms ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando disponibilidad...
            </div>
          ) : availableRooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay cabanas disponibles para las fechas seleccionadas.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => handleRoomSelect(room.id)}
                  className={`relative rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                    selectedRoomId === room.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {selectedRoomId === room.id && (
                    <div className="absolute right-2 top-2">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <p className="font-semibold text-foreground">{room.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {room.category?.name}
                  </p>
                  <p className="mt-1 text-sm font-medium text-primary">
                    {formatCurrency(room.category?.base_price ?? 0)} / noche
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Huesped */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-primary" />
            Huesped
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar huesped por nombre, email o telefono..."
                value={guestSearch}
                onChange={(e) => {
                  setGuestSearch(e.target.value)
                  if (selectedGuestId) setSelectedGuestId('')
                }}
                className="pl-9"
              />
              {loadingGuests && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Guest dropdown */}
            {showGuestDropdown && guests.length > 0 && !selectedGuestId && (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-surface shadow-lg">
                {guests.map((guest) => (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => {
                      setSelectedGuestId(guest.id)
                      setGuestSearch(
                        `${guest.first_name} ${guest.last_name}`
                      )
                      setShowGuestDropdown(false)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {guest.first_name[0]}
                      {guest.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {guest.first_name} {guest.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {guest.email || guest.phone || 'Sin contacto'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected guest card */}
            {selectedGuest && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {selectedGuest.first_name[0]}
                    {selectedGuest.last_name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedGuest.first_name} {selectedGuest.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[selectedGuest.email, selectedGuest.phone]
                        .filter(Boolean)
                        .join(' | ') || 'Sin contacto'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {guestSearch.length > 0 &&
              guestSearch.length < 2 &&
              !selectedGuestId && (
                <p className="text-xs text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar.
                </p>
              )}

            {guestSearch.length >= 2 &&
              !loadingGuests &&
              guests.length === 0 &&
              !selectedGuestId && (
                <p className="text-sm text-muted-foreground">
                  No se encontraron huespedes.{' '}
                  <a
                    href="/huespedes/nuevo"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Crear nuevo huesped
                  </a>
                </p>
              )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Detalles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Detalles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="adults">Adultos</Label>
              <Input
                id="adults"
                name="adults"
                type="number"
                min={1}
                max={10}
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Ninos</Label>
              <Input
                id="children"
                name="children"
                type="number"
                min={0}
                max={10}
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking_channel">Canal de reservacion</Label>
              <select
                id="booking_channel"
                name="booking_channel"
                value={bookingChannel}
                onChange={(e) => setBookingChannel(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.entries(BOOKING_CHANNELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel_reference">Referencia del canal</Label>
              <Input
                id="channel_reference"
                name="channel_reference"
                placeholder="# de confirmacion externo"
                value={channelReference}
                onChange={(e) => setChannelReference(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Tarifa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-primary" />
            Tarifa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="nightly_rate_display">Tarifa por noche</Label>
              <Input
                id="nightly_rate_display"
                type="number"
                min={0}
                step={50}
                value={nightlyRate}
                onChange={(e) =>
                  setNightlyRate(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_type_select">Tipo de descuento</Label>
              <select
                id="discount_type_select"
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value)
                  if (e.target.value === 'none') setDiscountValue(0)
                }}
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="none">Sin descuento</option>
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            {discountType !== 'none' && (
              <div className="space-y-2">
                <Label htmlFor="discount_value_input">
                  {discountType === 'percentage'
                    ? 'Porcentaje (%)'
                    : 'Monto ($)'}
                </Label>
                <Input
                  id="discount_value_input"
                  type="number"
                  min={0}
                  step={discountType === 'percentage' ? 1 : 50}
                  max={discountType === 'percentage' ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            )}
          </div>

          {/* Calculated summary */}
          {nights > 0 && nightlyRate > 0 && (
            <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {formatCurrency(nightlyRate)} x {nights} noche
                    {nights !== 1 ? 's' : ''}
                  </span>
                  <span>{formatCurrency(tariff.gross)}</span>
                </div>
                {discountType !== 'none' && discountValue > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      Descuento{' '}
                      {discountType === 'percentage'
                        ? `(${discountValue}%)`
                        : ''}
                    </span>
                    <span>-{formatCurrency(tariff.gross - tariff.subtotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(tariff.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (16%)</span>
                  <span>{formatCurrency(tariff.taxAmount)}</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatCurrency(tariff.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <StickyNote className="h-5 w-5 text-primary" />
            Notas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas de la reservacion</Label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Notas visibles para el huesped..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internal_notes">Notas internas</Label>
              <textarea
                id="internal_notes"
                name="internal_notes"
                rows={3}
                placeholder="Notas solo para el equipo..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            isPending ||
            !checkInDate ||
            !checkOutDate ||
            !selectedRoomId ||
            !selectedGuestId ||
            nights <= 0
          }
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear reservacion'
          )}
        </Button>
      </div>
    </form>
  )
}
