import Link from 'next/link'
import { ArrowLeft, Plus, Tag, Users, Baby, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { getRoomCategories } from '@/actions/rooms'
import { formatCurrency } from '@/lib/formatters'
import { DeleteCategoryButton } from '@/components/rooms/delete-category-button'

export default async function CategoriasPage() {
  const categories = await getRoomCategories()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categorias de cabanas"
        description="Gestiona los tipos de cabanas y sus tarifas"
      >
        <Button asChild>
          <Link href="/cabanas/categorias/nueva">
            <Plus className="h-4 w-4" />
            Nueva categoria
          </Link>
        </Button>
      </PageHeader>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Sin categorias"
          description="No se encontraron categorias de cabanas. Crea una para comenzar."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(category.base_price)}
                  </span>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {category.max_adults} adultos
                  </span>
                  <span className="flex items-center gap-1">
                    <Baby className="h-4 w-4" />
                    {category.max_children} ninos
                  </span>
                </div>

                {category.amenities && category.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {category.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/cabanas/categorias/${category.id}/editar`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Link>
                  </Button>
                  <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
