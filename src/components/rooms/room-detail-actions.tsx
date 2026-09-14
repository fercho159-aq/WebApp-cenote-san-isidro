'use client'

import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  updateRoomStatus,
  updateCleaningStatus,
  updateRoomNotes,
} from '@/actions/rooms'
import { ROOM_STATUSES, CLEANING_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { RoomStatus, CleaningStatus } from '@/types'

const roomStatusOptions: { value: RoomStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Disponible', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300' },
  { value: 'occupied', label: 'Ocupada', color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300' },
  { value: 'maintenance', label: 'Mantenimiento', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300' },
  { value: 'blocked', label: 'Bloqueada', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300' },
]

const cleaningStatusOptions: { value: CleaningStatus; label: string; color: string }[] = [
  { value: 'clean', label: 'Limpia', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-300' },
  { value: 'dirty', label: 'Sucia', color: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-300' },
  { value: 'in_progress', label: 'En limpieza', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300' },
]

interface RoomDetailActionsProps {
  roomId: string
  currentStatus: RoomStatus
  currentCleaningStatus: CleaningStatus
  currentNotes: string | null
}

export function RoomDetailActions({
  roomId,
  currentStatus,
  currentCleaningStatus,
  currentNotes,
}: RoomDetailActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState(currentNotes ?? '')
  const [notesSaved, setNotesSaved] = useState(false)

  function handleStatusChange(status: RoomStatus) {
    if (status === currentStatus) return
    startTransition(async () => {
      await updateRoomStatus(roomId, status)
    })
  }

  function handleCleaningChange(status: CleaningStatus) {
    if (status === currentCleaningStatus) return
    startTransition(async () => {
      await updateCleaningStatus(roomId, status)
    })
  }

  function handleSaveNotes() {
    startTransition(async () => {
      await updateRoomNotes(roomId, notes)
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Room Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de la cabana</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roomStatusOptions.map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleStatusChange(opt.value)}
                className={cn(
                  'border',
                  opt.value === currentStatus
                    ? cn(opt.color, 'ring-2 ring-offset-1 ring-primary/30')
                    : ''
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cleaning Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado de limpieza</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {cleaningStatusOptions.map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleCleaningChange(opt.value)}
                className={cn(
                  'border',
                  opt.value === currentCleaningStatus
                    ? cn(opt.color, 'ring-2 ring-offset-1 ring-primary/30')
                    : ''
                )}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[100px] rounded-lg border border-border bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            placeholder="Agregar notas sobre esta cabana..."
          />
          <div className="mt-3 flex items-center gap-3">
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleSaveNotes}
            >
              Guardar notas
            </Button>
            {notesSaved && (
              <span className="text-sm text-emerald-600">Notas guardadas</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
