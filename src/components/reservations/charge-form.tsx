'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCharge } from '@/actions/payments'
import { Loader2, Plus } from 'lucide-react'

interface ChargeFormProps {
  reservationId: string
}

export function ChargeForm({ reservationId }: ChargeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [chargeType, setChargeType] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await createCharge({
        reservationId,
        description,
        amount,
        chargeType: chargeType || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setDescription('')
        setAmount(0)
        setChargeType('')
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          Cargo registrado exitosamente.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="charge_description">Descripcion</Label>
          <Input
            id="charge_description"
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Servicio de lavanderia"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="charge_amount">Monto</Label>
          <Input
            id="charge_amount"
            type="number"
            min={0.01}
            step={0.01}
            required
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="charge_type">Tipo (opcional)</Label>
          <select
            id="charge_type"
            value={chargeType}
            onChange={(e) => setChargeType(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Sin tipo</option>
            <option value="minibar">Minibar</option>
            <option value="room_service">Room service</option>
            <option value="laundry">Lavanderia</option>
            <option value="damage">Dano</option>
            <option value="extra_night">Noche extra</option>
            <option value="activity">Actividad</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isPending || amount <= 0 || !description.trim()}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Agregar cargo
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
