import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryForm } from '@/components/rooms/category-form'

export default function NuevaCategoriaPage() {
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
            Nueva categoria
          </h1>
          <p className="text-sm text-muted-foreground">
            Crear un nuevo tipo de cabana
          </p>
        </div>
      </div>

      <CategoryForm />
    </div>
  )
}
