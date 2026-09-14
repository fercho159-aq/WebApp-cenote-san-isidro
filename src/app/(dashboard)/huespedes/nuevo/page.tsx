import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createGuest } from '@/actions/guests'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { GuestForm } from '@/components/guests/guest-form'

export default function NuevoHuespedPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Nuevo huésped" description="Registrar un nuevo huésped">
        <Button variant="outline" asChild>
          <Link href="/huespedes">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <GuestForm action={createGuest} />
      </div>
    </div>
  )
}
