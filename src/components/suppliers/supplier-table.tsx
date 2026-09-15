import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SupplierDeleteButton } from '@/components/suppliers/supplier-delete-button'
import type { Supplier } from '@/types'

interface SupplierTableProps {
  suppliers: Supplier[]
}

export function SupplierTable({ suppliers }: SupplierTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Nombre
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Contacto
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Telefono
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              RFC
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
          {suppliers.map((supplier) => (
            <tr
              key={supplier.id}
              className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {supplier.name}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {supplier.contact_name ?? '-'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {supplier.phone ?? '-'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {supplier.email ?? '-'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {supplier.rfc ?? '-'}
              </td>
              <td className="px-4 py-3 text-center">
                <Badge variant={supplier.is_active ? 'success' : 'secondary'}>
                  {supplier.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/proveedores/${supplier.id}/editar`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar</span>
                    </Link>
                  </Button>
                  <SupplierDeleteButton id={supplier.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
