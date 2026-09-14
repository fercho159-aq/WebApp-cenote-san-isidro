import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Guest } from '@/types'

interface GuestTableProps {
  guests: Guest[]
}

const ID_DOCUMENT_LABELS: Record<string, string> = {
  INE: 'INE',
  Pasaporte: 'Pasaporte',
  Licencia: 'Licencia',
  Otro: 'Otro',
}

export function GuestTable({ guests }: GuestTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Nombre
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Teléfono
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Documento
            </th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">
              Estancias
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {guests.map((guest) => (
            <tr
              key={guest.id}
              className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/huespedes/${guest.id}`}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {guest.last_name}, {guest.first_name}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {guest.email ?? '-'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {guest.phone ?? '-'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {guest.id_document_type
                  ? `${ID_DOCUMENT_LABELS[guest.id_document_type] ?? guest.id_document_type}: ${guest.id_document_number ?? ''}`
                  : '-'}
              </td>
              <td className="px-4 py-3 text-center">
                <Badge variant={guest.total_stays > 0 ? 'success' : 'secondary'}>
                  {guest.total_stays}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/huespedes/${guest.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver perfil</span>
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
