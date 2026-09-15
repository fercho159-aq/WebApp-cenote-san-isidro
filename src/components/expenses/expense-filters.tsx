'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { ExpenseCategory } from '@/types'

interface ExpenseFiltersProps {
  categories: ExpenseCategory[]
}

export function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categoryId, setCategoryId] = useState(
    searchParams.get('categoryId') ?? ''
  )
  const [startDate, setStartDate] = useState(
    searchParams.get('startDate') ?? ''
  )
  const [endDate, setEndDate] = useState(searchParams.get('endDate') ?? '')

  function applyFilters() {
    const params = new URLSearchParams()
    if (categoryId) params.set('categoryId', categoryId)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    router.push(`/gastos?${params.toString()}`)
  }

  function clearFilters() {
    setCategoryId('')
    setStartDate('')
    setEndDate('')
    router.push('/gastos')
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2">
          <Label htmlFor="filter-category">Categoria</Label>
          <select
            id="filter-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-10 w-full min-w-[180px] rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Todas las categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-start">Fecha inicio</Label>
          <Input
            id="filter-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-end">Fecha fin</Label>
          <Input
            id="filter-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={applyFilters} size="sm">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          {(categoryId || startDate || endDate) && (
            <Button onClick={clearFilters} variant="outline" size="sm">
              Limpiar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
