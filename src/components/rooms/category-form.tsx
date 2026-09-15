'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createRoomCategory, updateRoomCategory } from '@/actions/rooms'
import { Loader2, Tag, X } from 'lucide-react'
import type { RoomCategory } from '@/types'

interface CategoryFormProps {
  category?: RoomCategory
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [basePrice, setBasePrice] = useState(category?.base_price ?? 0)
  const [maxAdults, setMaxAdults] = useState(category?.max_adults ?? 2)
  const [maxChildren, setMaxChildren] = useState(category?.max_children ?? 2)
  const [amenities, setAmenities] = useState<string[]>(category?.amenities ?? [])
  const [newAmenity, setNewAmenity] = useState('')
  const [sortOrder, setSortOrder] = useState(category?.sort_order ?? 0)

  function addAmenity() {
    const trimmed = newAmenity.trim()
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities([...amenities, trimmed])
      setNewAmenity('')
    }
  }

  function removeAmenity(index: number) {
    setAmenities(amenities.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      basePrice,
      maxAdults,
      maxChildren,
      amenities,
      sortOrder,
    }

    if (!data.name) {
      setError('El nombre es obligatorio.')
      return
    }

    if (data.basePrice < 0) {
      setError('El precio base no puede ser negativo.')
      return
    }

    startTransition(async () => {
      const result = category
        ? await updateRoomCategory(category.id, data)
        : await createRoomCategory(data)

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/cabanas/categorias')
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
            <Tag className="h-5 w-5 text-primary" />
            {category ? 'Editar categoria' : 'Nueva categoria'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                required
                placeholder="Ej. Suite Premium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrice">Precio base por noche (MXN) *</Label>
              <Input
                id="basePrice"
                type="number"
                required
                min={0}
                step={50}
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Descripcion de la categoria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxAdults">Max. adultos *</Label>
              <Input
                id="maxAdults"
                type="number"
                required
                min={1}
                max={20}
                value={maxAdults}
                onChange={(e) => setMaxAdults(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxChildren">Max. ninos *</Label>
              <Input
                id="maxChildren"
                type="number"
                required
                min={0}
                max={20}
                value={maxChildren}
                onChange={(e) => setMaxChildren(parseInt(e.target.value) || 0)}
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

          {/* Amenities */}
          <div className="space-y-2">
            <Label>Amenidades</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ej. WiFi, Aire acondicionado..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAmenity()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addAmenity}>
                Agregar
              </Button>
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="ml-0.5 rounded-sm hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              {category ? 'Guardando...' : 'Creando...'}
            </>
          ) : category ? (
            'Guardar cambios'
          ) : (
            'Crear categoria'
          )}
        </Button>
      </div>
    </form>
  )
}
