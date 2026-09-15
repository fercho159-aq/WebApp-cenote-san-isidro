import Link from 'next/link'
import { Plus, Package, Search, Pencil, Trash2 } from 'lucide-react'
import { getProducts, getProductCategories, deleteProduct } from '@/actions/products'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/formatters'

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>
}) {
  const { q, cat } = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(cat),
    getProductCategories(),
  ])

  // Filter by search term client-side (name, sku)
  const filtered = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(q.toLowerCase()))
      )
    : products

  // Group products by category
  const grouped = categories
    .map((cat) => ({
      category: cat,
      products: filtered.filter((p) => p.category_id === cat.id),
    }))
    .filter((g) => g.products.length > 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Productos" description="Administra los productos que se venden en el punto de venta: alimentos, bebidas, artículos de tienda, etc. Define precios, costos y categorías.">
        <Button asChild>
          <Link href="/productos/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Link>
        </Button>
      </PageHeader>

      {/* Search bar */}
      <form className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            placeholder="Buscar por nombre o SKU..."
            defaultValue={q ?? ''}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
        {q && (
          <Button variant="ghost" size="sm" asChild>
            <Link href="/productos">Limpiar</Link>
          </Button>
        )}
      </form>

      {filtered.length > 0 ? (
        <div className="space-y-8">
          {grouped.map(({ category, products: catProducts }) => (
            <div key={category.id}>
              <h2 className="mb-3 text-lg font-semibold text-foreground">
                {category.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({catProducts.length})
                </span>
              </h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Precio
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Costo
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {catProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            {product.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {product.sku || '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          {formatCurrency(Number(product.price))}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {Number(product.cost) > 0 ? formatCurrency(Number(product.cost)) : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {product.is_active ? (
                            <Badge variant="success">Activo</Badge>
                          ) : (
                            <Badge variant="secondary">Inactivo</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/productos/${product.id}/editar`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <form
                              action={async () => {
                                'use server'
                                await deleteProduct(product.id)
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                type="submit"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No hay productos"
          description={
            q
              ? 'No se encontraron productos con los criterios de busqueda.'
              : 'Agrega tu primer producto para comenzar.'
          }
        >
          {!q && (
            <Button asChild>
              <Link href="/productos/nuevo">
                <Plus className="h-4 w-4" />
                Nuevo producto
              </Link>
            </Button>
          )}
        </EmptyState>
      )}
    </div>
  )
}
