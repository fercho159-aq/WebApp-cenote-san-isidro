'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Guest } from '@/types'

interface GuestFormProps {
  guest?: Guest
  action: (formData: FormData) => Promise<{ error: string } | void>
}

export function GuestForm({ guest, action }: GuestFormProps) {
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

  const isEdit = !!guest

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre *</Label>
              <Input
                id="first_name"
                name="first_name"
                placeholder="Nombre"
                defaultValue={guest?.first_name ?? ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido *</Label>
              <Input
                id="last_name"
                name="last_name"
                placeholder="Apellido"
                defaultValue={guest?.last_name ?? ''}
                required
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
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                defaultValue={guest?.email ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+52 999 123 4567"
                defaultValue={guest?.phone ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="id_document_type">Tipo de documento</Label>
              <select
                id="id_document_type"
                name="id_document_type"
                defaultValue={guest?.id_document_type ?? ''}
                className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Seleccionar...</option>
                <option value="INE">INE</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="Licencia">Licencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_document_number">Número de documento</Label>
              <Input
                id="id_document_number"
                name="id_document_number"
                placeholder="Número de documento"
                defaultValue={guest?.id_document_number ?? ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nacionalidad</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  placeholder="Nacionalidad"
                  defaultValue={guest?.nationality ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="País"
                  defaultValue={guest?.country ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Estado"
                  defaultValue={guest?.state ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Ciudad"
                  defaultValue={guest?.city ?? ''}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                name="address"
                placeholder="Dirección completa"
                defaultValue={guest?.address ?? ''}
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
              placeholder="Preferencias, alergias, solicitudes especiales..."
              defaultValue={guest?.notes ?? ''}
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
              ? 'Actualizar huésped'
              : 'Guardar huésped'}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/huespedes">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
