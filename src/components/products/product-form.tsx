'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product, ProductCategory } from '@/types'

interface ProductFormProps {
  product?: Product
  categories: ProductCategory[]
  action: (formData: FormData) => Promise<{ error: string } | void>
}

export function ProductForm({ product, categories, action }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      const result = await action(formData)
      if (result && 'error' in result) {
        return result
      }
      return null
    },
    null
  )

  const isEdit = !!product

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informacion del producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre del producto"
                defaultValue={product?.name ?? ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria *</Label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={product?.category_id ?? ''}
                required
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Seleccionar categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Descripcion del producto..."
              defaultValue={product?.description ?? ''}
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Precio de venta (MXN) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={product?.price ?? ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Costo (MXN)</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={product?.cost ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identificacion e inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Codigo</Label>
              <Input
                id="sku"
                name="sku"
                placeholder="SKU-001"
                defaultValue={product?.sku ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Orden</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                min="0"
                placeholder="0"
                defaultValue={product?.sort_order ?? 0}
              />
            </div>
            <div className="flex items-end space-x-2 pb-1">
              <input
                id="track_inventory"
                name="track_inventory"
                type="checkbox"
                defaultChecked={product?.track_inventory ?? false}
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              <Label htmlFor="track_inventory">Controlar inventario</Label>
            </div>
          </div>

          {isEdit && (
            <div className="mt-4 flex items-center space-x-2">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                defaultChecked={product?.is_active ?? true}
                value="on"
                className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
              />
              <Label htmlFor="is_active">Producto activo</Label>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending
            ? 'Guardando...'
            : isEdit
              ? 'Actualizar producto'
              : 'Guardar producto'}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/productos">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
