'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

const ENTITY_LABELS: Record<string, string> = {
  reservation: 'Reservación',
  guest: 'Huésped',
  room: 'Cabaña',
  payment: 'Pago',
  user: 'Usuario',
  room_category: 'Categoría',
  package: 'Paquete',
}

export function AuditFilters({
  entityTypes,
  currentEntityType,
  currentStart,
  currentEnd,
}: {
  entityTypes: string[]
  currentEntityType: string
  currentStart: string
  currentEnd: string
}) {
  const router = useRouter()
  const [entityType, setEntityType] = useState(currentEntityType)
  const [start, setStart] = useState(currentStart)
  const [end, setEnd] = useState(currentEnd)

  function handleFilter() {
    const params = new URLSearchParams()
    if (entityType) params.set('entityType', entityType)
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    router.push(`/registros?${params.toString()}`)
  }

  function handleClear() {
    setEntityType('')
    setStart('')
    setEnd('')
    router.push('/registros')
  }

  const hasFilters = entityType || start || end

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Tipo de entidad</label>
        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">Todas</option>
          {entityTypes.map((type) => (
            <option key={type} value={type}>
              {ENTITY_LABELS[type] || type}
            </option>
          ))}
        </select>
      </div>
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
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
