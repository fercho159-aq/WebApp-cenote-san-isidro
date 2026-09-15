import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getUsers, getPropertySettings } from '@/actions/settings'
import {
  Building2,
  Users,
  Receipt,
  BedDouble,
  UserPlus,
  Pencil,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
} from 'lucide-react'
import Link from 'next/link'
import { UserToggleActive } from './user-toggle-active'

export default async function ConfiguracionPage() {
  const [users, property] = await Promise.all([
    getUsers(),
    getPropertySettings(),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Administra la propiedad, usuarios e impuestos"
      />

      {/* Property Settings */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Propiedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="text-sm font-medium text-foreground">{property.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dirección</p>
                    <p className="text-sm text-foreground">{property.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm text-foreground">{property.phone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{property.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sitio web</p>
                    <p className="text-sm text-foreground">{property.website}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Horarios</p>
                    <p className="text-sm text-foreground">
                      Check-in: {property.checkInTime} &middot; Check-out: {property.checkOutTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Users */}
      <section>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios ({users.length})
            </CardTitle>
            <Link href="/configuracion/usuarios/nuevo">
              <Button size="sm">
                <UserPlus className="h-4 w-4" />
                Nuevo usuario
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No hay usuarios registrados
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Nombre</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Email</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Rol</th>
                      <th className="pb-2 text-center font-medium text-muted-foreground">Estado</th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0">
                        <td className="py-3 font-medium text-foreground">{user.fullName}</td>
                        <td className="py-3 text-muted-foreground">{user.email}</td>
                        <td className="py-3">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                          </Badge>
                        </td>
                        <td className="py-3 text-center">
                          <UserToggleActive userId={user.id} isActive={user.isActive} />
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/configuracion/usuarios/${user.id}/editar`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Tax Settings */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Impuestos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium text-foreground">IVA</p>
                <p className="text-xs text-muted-foreground">Impuesto al Valor Agregado</p>
              </div>
              <p className="text-2xl font-bold text-primary">{property.taxRate}%</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Room Categories link */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              Categorías de habitación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/cabanas/categorias">
              <Button variant="outline">
                <BedDouble className="h-4 w-4" />
                Administrar categorías
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
