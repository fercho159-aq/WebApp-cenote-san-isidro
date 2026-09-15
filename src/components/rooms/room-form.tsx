'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createRoom, updateRoom } from '@/actions/rooms'
import { Loader2, BedDouble } from 'lucide-react'
import type { Room, RoomCategory } from '@/types'

interface RoomFormProps {
  room?: Room
  categories: RoomCategory[]
}

export function RoomForm({ room, categories }: RoomFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(room?.name ?? '')
  const [categoryId, setCategoryId] = useState(room?.category_id ?? (categories[0]?.id ?? ''))
  const [floor, setFloor] = useState(room?.floor ?? '')
  const [notes, setNotes] = useState(room?.notes ?? '')
  const [sortOrder, setSortOrder] = useState(room?.sort_order ?? 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const data = {
      name: name.trim(),
      categoryId,
      floor: floor.trim() || undefined,
      notes: notes.trim() || undefined,
      sortOrder,
    }

    if (!data.name) {
      setError('El nombre es obligatorio.')
      return
    }

    if (!data.categoryId) {
      setError('Debe seleccionar una categoria.')
      return
    }

    startTransition(async () => {
      const result = room
        ? await updateRoom(room.id, data)
        : await createRoom(data)

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/cabanas')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BedDouble className="h-5 w-5 text-primary" />
            {room ? 'Editar cabana' : 'Nueva cabana'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                required
                placeholder="Ej. Cabana 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="" disabled>
                  Seleccionar categoria
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="floor">Piso / Ubicacion</Label>
              <Input
                id="floor"
                placeholder="Ej. Planta baja"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Orden</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Notas sobre la cabana..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {room ? 'Guardando...' : 'Creando...'}
            </>
          ) : room ? (
            'Guardar cambios'
          ) : (
            'Crear cabana'
          )}
        </Button>
      </div>
    </form>
  )
}
