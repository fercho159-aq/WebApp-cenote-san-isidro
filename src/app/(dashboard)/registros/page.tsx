import { Suspense } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { getAuditLog, getAuditEntityTypes } from '@/actions/audit'
import { formatDateTime } from '@/lib/formatters'
import { FileText, Search } from 'lucide-react'
import { AuditFilters } from './audit-filters'

export default function RegistrosPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; start?: string; end?: string }>
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Registros de auditoría"
        description="Bitácora de todas las acciones realizadas en el sistema: quién creó, editó o canceló reservaciones, pagos y otros registros. Útil para supervisión y control interno."
      />
      <Suspense fallback={<AuditSkeleton />}>
        <AuditContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  )
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Creación',
  update: 'Actualización',
  delete: 'Eliminación',
  check_in: 'Check-in',
  check_out: 'Check-out',
  cancel: 'Cancelación',
  payment: 'Pago',
  void: 'Anulación',
}

const ENTITY_LABELS: Record<string, string> = {
  reservation: 'Reservación',
  guest: 'Huésped',
  room: 'Cabaña',
  payment: 'Pago',
  user: 'Usuario',
  room_category: 'Categoría',
  package: 'Paquete',
}

const ACTION_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  create: 'success',
  update: 'default',
  delete: 'destructive',
  check_in: 'success',
  check_out: 'secondary',
  cancel: 'destructive',
  payment: 'success',
  void: 'warning',
}

async function AuditContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ entityType?: string; start?: string; end?: string }>
}) {
  const searchParams = await searchParamsPromise
  const entityType = searchParams.entityType || undefined
  const startDate = searchParams.start || undefined
  const endDate = searchParams.end || undefined

  const [entries, entityTypes] = await Promise.all([
    getAuditLog({ entityType, startDate, endDate, limit: 100 }),
    getAuditEntityTypes(),
  ])

  return (
    <>
      <AuditFilters
        entityTypes={entityTypes}
        currentEntityType={entityType || ''}
        currentStart={startDate || ''}
        currentEnd={endDate || ''}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin registros"
          description="No se encontraron registros de auditoría para los filtros seleccionados. Los registros aparecerán conforme se realicen acciones en el sistema."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Entidad</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acción</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Detalles</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatDateTime(entry.performedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-foreground">
                            {ENTITY_LABELS[entry.entityType] || entry.entityType}
                          </span>
                          <p className="text-xs text-muted-foreground font-mono">
                            {entry.entityId.substring(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ACTION_COLORS[entry.action] || 'secondary'}>
                          {ACTION_LABELS[entry.action] || entry.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <AuditDetails oldData={entry.oldData} newData={entry.newData} />
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {entry.performerName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Mostrando {entries.length} registro{entries.length !== 1 ? 's' : ''} más reciente{entries.length !== 1 ? 's' : ''}
      </p>
    </>
  )
}

function AuditDetails({
  oldData,
  newData,
}: {
  oldData: Record<string, unknown> | null
  newData: Record<string, unknown> | null
}) {
  if (!oldData && !newData) {
    return <span className="text-muted-foreground">-</span>
  }

  // Show changed fields
  if (oldData && newData) {
    const changes: string[] = []
    for (const key of Object.keys(newData)) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push(key)
      }
    }
    if (changes.length === 0) {
      return <span className="text-muted-foreground">Sin cambios detectados</span>
    }
    return (
      <div className="text-xs text-muted-foreground">
        <span className="font-medium">Campos:</span> {changes.join(', ')}
      </div>
    )
  }

  // Only new data (create)
  if (newData) {
    const keys = Object.keys(newData).slice(0, 5)
    return (
      <div className="text-xs text-muted-foreground">
        {keys.join(', ')}{Object.keys(newData).length > 5 ? '...' : ''}
      </div>
    )
  }

  return <span className="text-muted-foreground">-</span>
}

function AuditSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-muted rounded-xl animate-pulse" />
    </div>
  )
}
