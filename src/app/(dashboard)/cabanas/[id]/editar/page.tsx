import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoomForm } from '@/components/rooms/room-form'
import { getRoomById, getRoomCategories } from '@/actions/rooms'

export default async function EditarCabanaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [room, categories] = await Promise.all([
    getRoomById(id),
    getRoomCategories(),
  ])

  if (!room) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/cabanas/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Editar {room.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Modificar los datos de la cabana
          </p>
        </div>
      </div>

      <RoomForm room={room} categories={categories} />
    </div>
  )
}
