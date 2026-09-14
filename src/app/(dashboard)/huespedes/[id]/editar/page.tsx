import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getGuestById, updateGuest } from '@/actions/guests'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { GuestForm } from '@/components/guests/guest-form'

export default async function EditarHuespedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getGuestById(id)

  if (!data) {
    notFound()
  }

  const { guest } = data

  const updateGuestWithId = async (formData: FormData) => {
    'use server'
    return updateGuest(id, formData)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar huésped"
        description={`${guest.first_name} ${guest.last_name}`}
      >
        <Button variant="outline" asChild>
          <Link href={`/huespedes/${guest.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Volver al perfil
          </Link>
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-3xl">
        <GuestForm guest={guest} action={updateGuestWithId} />
      </div>
    </div>
  )
}
