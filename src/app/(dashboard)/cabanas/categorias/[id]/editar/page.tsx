import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryForm } from '@/components/rooms/category-form'
import { getRoomCategoryById } from '@/actions/rooms'

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await getRoomCategoryById(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cabanas/categorias">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Editar {category.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Modificar los datos de la categoria
          </p>
        </div>
      </div>

      <CategoryForm category={category} />
    </div>
  )
}
