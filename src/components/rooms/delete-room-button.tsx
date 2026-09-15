'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { deleteRoom } from '@/actions/rooms'
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteRoomButtonProps {
  roomId: string
  roomName: string
}

export function DeleteRoomButton({ roomId, roomName }: DeleteRoomButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`¿Estas seguro de eliminar "${roomName}"? Esta accion no se puede deshacer.`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteRoom(roomId)
      if (result?.error) {
        alert(result.error)
      } else {
        router.push('/cabanas')
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-destructive hover:text-destructive"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <>
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </>
      )}
    </Button>
  )
}
