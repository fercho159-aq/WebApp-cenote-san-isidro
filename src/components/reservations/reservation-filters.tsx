'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RESERVATION_STATUSES } from '@/lib/constants'
import { Search, X } from 'lucide-react'

export function ReservationFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentStatus = searchParams.get('status') || 'all'
  const currentSearch = searchParams.get('search') || ''
  const currentStartDate = searchParams.get('startDate') || ''
  const currentEndDate = searchParams.get('endDate') || ''

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      })
      startTransition(() => {
        router.push(`/reservaciones?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const clearFilters = () => {
    startTransition(() => {
      router.push('/reservaciones')
    })
  }

  const hasFilters =
    currentStatus !== 'all' ||
    currentSearch ||
    currentStartDate ||
    currentEndDate

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o # reservación..."
          defaultValue={currentSearch}
          className="pl-9"
          onChange={(e) => {
            const value = e.target.value
            // Debounce: wait 400ms after user stops typing
            const timeout = setTimeout(() => {
              updateParams({ search: value })
            }, 400)
            return () => clearTimeout(timeout)
          }}
        />
      </div>

      {/* Status */}
      <div>
        <select
          value={currentStatus}
          onChange={(e) => updateParams({ status: e.target.value })}
          className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-44"
        >
          <option value="all">Todos los estados</option>
          {Object.entries(RESERVATION_STATUSES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={currentStartDate}
          onChange={(e) => updateParams({ startDate: e.target.value })}
          className="w-36"
          aria-label="Fecha inicio"
        />
        <span className="text-sm text-muted-foreground">a</span>
        <Input
          type="date"
          value={currentEndDate}
          onChange={(e) => updateParams({ endDate: e.target.value })}
          className="w-36"
          aria-label="Fecha fin"
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
