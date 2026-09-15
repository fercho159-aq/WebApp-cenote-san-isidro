import { notFound } from 'next/navigation'
import { getUserById } from '@/actions/settings'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EditUserForm } from './edit-user-form'

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUserById(id)

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Editar usuario" description={user.fullName}>
        <Link href="/configuracion">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
      </PageHeader>

      <EditUserForm user={user} />
    </div>
  )
}
