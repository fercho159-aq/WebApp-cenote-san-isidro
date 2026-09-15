'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Supplier } from '@/types'

interface SupplierFormProps {
  supplier?: Supplier
  action: (formData: FormData) => Promise<{ error: string } | void>
}

export function SupplierForm({ supplier, action }: SupplierFormProps) {
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

  const isEdit = !!supplier

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informacion del proveedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del proveedor *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nombre o razon social"
                defaultValue={supplier?.name ?? ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name">Persona de contacto</Label>
              <Input
                id="contact_name"
                name="contact_name"
                placeholder="Nombre del contacto"
                defaultValue={supplier?.contact_name ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+52 999 123 4567"
                defaultValue={supplier?.phone ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@proveedor.com"
                defaultValue={supplier?.email ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos fiscales y ubicacion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                name="rfc"
                placeholder="XAXX010101000"
                defaultValue={supplier?.rfc ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Direccion</Label>
              <Input
                id="address"
                name="address"
                placeholder="Direccion completa"
                defaultValue={supplier?.address ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Condiciones de pago, horarios de entrega, etc."
              defaultValue={supplier?.notes ?? ''}
              className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending
            ? 'Guardando...'
            : isEdit
              ? 'Actualizar proveedor'
              : 'Guardar proveedor'}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/proveedores">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
