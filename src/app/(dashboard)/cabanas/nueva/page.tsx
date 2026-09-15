import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoomForm } from '@/components/rooms/room-form'
import { getRoomCategories } from '@/actions/rooms'

export default async function NuevaCabanaPage() {
  const categories = await getRoomCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cabanas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nueva cabana
          </h1>
          <p className="text-sm text-muted-foreground">
            Registrar una nueva cabana en el sistema
          </p>
        </div>
      </div>

      <RoomForm categories={categories} />
    </div>
  )
}
