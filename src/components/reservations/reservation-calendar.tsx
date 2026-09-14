'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getCalendarData } from '@/actions/reservations'
import { formatCurrency } from '@/lib/formatters'
import { RESERVATION_STATUSES } from '@/lib/constants'
import type { Reservation, Room, ReservationStatus } from '@/types'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
} from 'lucide-react'

const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: 'bg-amber-400/80 hover:bg-amber-400 border-amber-500',
  confirmed: 'bg-emerald-400/80 hover:bg-emerald-400 border-emerald-500',
  checked_in: 'bg-blue-400/80 hover:bg-blue-400 border-blue-500',
  checked_out: 'bg-gray-400/80 hover:bg-gray-400 border-gray-500',
  cancelled: 'bg-red-400/80 hover:bg-red-400 border-red-500',
  no_show: 'bg-gray-300/80 hover:bg-gray-300 border-gray-400',
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDay(date: Date): string {
  return date.getDate().toString()
}

function isSameDay(a: string, b: string): boolean {
  return a === b
}

type CalendarReservation = Omit<Reservation, 'guest' | 'room'> & {
  guest?: { first_name: string; last_name: string }
  room?: { name: string }
}

export function ReservationCalendar() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState<Room[]>([])
  const [reservations, setReservations] = useState<CalendarReservation[]>([])

  // Calendar date range: start from today, show 14 days
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [daysToShow] = useState(14)

  const endDate = useMemo(
    () => addDays(startDate, daysToShow),
    [startDate, daysToShow]
  )

  const dates = useMemo(() => {
    const result: Date[] = []
    for (let i = 0; i < daysToShow; i++) {
      result.push(addDays(startDate, i))
    }
    return result
  }, [startDate, daysToShow])

  // Load calendar data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCalendarData(
        formatDateISO(startDate),
        formatDateISO(endDate)
      )
      setRooms(data.rooms)
      setReservations(data.reservations)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Navigate
  const goBack = () => setStartDate((d) => addDays(d, -7))
  const goForward = () => setStartDate((d) => addDays(d, 7))
  const goToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setStartDate(today)
  }

  // Calculate occupancy
  const occupancy = useMemo(() => {
    const todayStr = formatDateISO(new Date())
    const activeReservations = reservations.filter(
      (r) =>
        r.status !== 'cancelled' &&
        r.status !== 'no_show' &&
        r.check_in_date <= todayStr &&
        r.check_out_date > todayStr
    )
    if (rooms.length === 0) return 0
    return Math.round((activeReservations.length / rooms.length) * 100)
  }, [reservations, rooms])

  // Get reservations for a specific room, positioned in the calendar
  const getReservationsForRoom = useCallback(
    (roomId: string) => {
      return reservations.filter((r) => r.room_id === roomId)
    },
    [reservations]
  )

  // Calculate bar position for a reservation in the grid
  const getBarPosition = useCallback(
    (reservation: CalendarReservation) => {
      const startStr = formatDateISO(startDate)
      const resStart = reservation.check_in_date
      const resEnd = reservation.check_out_date

      // Clamp to visible range
      const visibleStart =
        resStart < startStr ? startStr : resStart
      const endStr = formatDateISO(endDate)
      const visibleEnd = resEnd > endStr ? endStr : resEnd

      // Find column indices
      let startCol = -1
      let endCol = -1

      for (let i = 0; i < dates.length; i++) {
        const dateStr = formatDateISO(dates[i])
        if (dateStr === visibleStart) startCol = i
        if (dateStr === visibleEnd) endCol = i
      }

      // If start is before visible range, clamp to 0
      if (startCol === -1 && resStart < startStr) startCol = 0
      // If end is past visible range, clamp to last
      if (endCol === -1 && resEnd > endStr) endCol = dates.length

      if (startCol === -1 || endCol === -1) return null
      if (endCol <= startCol) return null

      const span = endCol - startCol

      return { startCol, span }
    },
    [startDate, endDate, dates]
  )

  const todayStr = formatDateISO(new Date())

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToday}>
            <Calendar className="h-4 w-4" />
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goForward}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-medium text-foreground">
            {startDate.toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
            })}{' '}
            -{' '}
            {addDays(startDate, daysToShow - 1).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Occupancy */}
          <div className="text-sm">
            <span className="text-muted-foreground">Ocupacion hoy: </span>
            <span className="font-semibold text-foreground">{occupancy}%</span>
          </div>

          {/* Legend */}
          <div className="hidden items-center gap-3 md:flex">
            {(
              ['pending', 'confirmed', 'checked_in'] as ReservationStatus[]
            ).map((status) => (
              <div key={status} className="flex items-center gap-1.5">
                <div
                  className={`h-3 w-3 rounded-sm ${STATUS_COLORS[status].split(' ')[0]}`}
                />
                <span className="text-xs text-muted-foreground">
                  {RESERVATION_STATUSES[status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <TooltipProvider delayDuration={200}>
            <div
              className="grid min-w-[800px]"
              style={{
                gridTemplateColumns: `180px repeat(${daysToShow}, minmax(60px, 1fr))`,
              }}
            >
              {/* Header row */}
              <div className="sticky left-0 z-20 border-b border-r border-border bg-muted px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Cabana
                </span>
              </div>
              {dates.map((date) => {
                const dateStr = formatDateISO(date)
                const isToday = isSameDay(dateStr, todayStr)
                const isWeekend = date.getDay() === 0 || date.getDay() === 6

                return (
                  <div
                    key={dateStr}
                    className={`border-b border-r border-border px-1 py-2 text-center ${
                      isToday
                        ? 'bg-primary/10'
                        : isWeekend
                          ? 'bg-muted/50'
                          : 'bg-muted'
                    }`}
                  >
                    <div
                      className={`text-xs font-medium ${
                        isToday
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {DAY_NAMES[date.getDay()]}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        isToday ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {formatDay(date)}
                    </div>
                  </div>
                )
              })}

              {/* Room rows */}
              {rooms.map((room) => {
                const roomReservations = getReservationsForRoom(room.id)

                return (
                  <div key={room.id} className="contents">
                    {/* Room name */}
                    <div className="sticky left-0 z-10 flex items-center border-b border-r border-border bg-card px-3 py-1">
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {room.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {room.category?.name}
                        </p>
                      </div>
                    </div>

                    {/* Date cells for this room */}
                    {dates.map((date) => {
                      const dateStr = formatDateISO(date)
                      const isToday = isSameDay(dateStr, todayStr)
                      const isWeekend =
                        date.getDay() === 0 || date.getDay() === 6

                      // Find reservation that starts on this date for this room
                      const startingRes = roomReservations.find(
                        (r) => r.check_in_date === dateStr
                      )

                      // Find if any reservation covers this date (for bg highlighting)
                      const coveringRes = roomReservations.find(
                        (r) =>
                          r.check_in_date <= dateStr &&
                          r.check_out_date > dateStr
                      )

                      return (
                        <div
                          key={`${room.id}-${dateStr}`}
                          className={`relative border-b border-r border-border ${
                            isToday
                              ? 'bg-primary/5'
                              : isWeekend
                                ? 'bg-background/50'
                                : 'bg-card'
                          }`}
                          style={{ minHeight: '48px' }}
                        >
                          {/* Reservation bar (starts here) */}
                          {startingRes && (() => {
                            const pos = getBarPosition(startingRes)
                            if (!pos) return null
                            const status =
                              startingRes.status as ReservationStatus
                            const guestName = startingRes.guest
                              ? `${startingRes.guest.first_name} ${startingRes.guest.last_name}`
                              : 'Huesped'

                            return (
                              <Tooltip key={startingRes.id}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/reservaciones/${startingRes.id}`
                                      )
                                    }
                                    className={`absolute left-0.5 top-1 z-10 flex h-[calc(100%-8px)] cursor-pointer items-center overflow-hidden rounded border px-1.5 text-xs font-medium text-white shadow-sm transition-all ${STATUS_COLORS[status]}`}
                                    style={{
                                      width: `calc(${pos.span * 100}% - 4px)`,
                                    }}
                                  >
                                    <span className="truncate">
                                      {guestName}
                                    </span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-xs"
                                >
                                  <div className="space-y-1">
                                    <p className="font-semibold">
                                      {guestName}
                                    </p>
                                    <p className="text-xs">
                                      {startingRes.reservation_number}
                                    </p>
                                    <p className="text-xs">
                                      {new Date(
                                        startingRes.check_in_date + 'T12:00:00'
                                      ).toLocaleDateString('es-MX', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}{' '}
                                      -{' '}
                                      {new Date(
                                        startingRes.check_out_date + 'T12:00:00'
                                      ).toLocaleDateString('es-MX', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </p>
                                    <p className="text-xs">
                                      {startingRes.nights} noche
                                      {startingRes.nights !== 1 ? 's' : ''} |{' '}
                                      {RESERVATION_STATUSES[status]}
                                    </p>
                                    <p className="text-xs font-medium">
                                      {formatCurrency(startingRes.total)}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )
                          })()}

                          {/* Empty cell click → new reservation */}
                          {!coveringRes && (
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/reservaciones/nueva?room=${room.id}&checkIn=${dateStr}`
                                )
                              }
                              className="absolute inset-0 opacity-0 hover:opacity-100"
                              aria-label={`Nueva reservacion para ${room.name} el ${dateStr}`}
                            >
                              <span className="flex h-full w-full items-center justify-center text-xs text-primary/60">
                                +
                              </span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
