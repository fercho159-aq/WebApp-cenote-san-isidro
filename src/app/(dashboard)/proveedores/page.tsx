import { Building2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function ProveedoresPage() {
  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={Building2}
        title="Proveedores"
        description="Esta sección está en desarrollo. Próximamente podrás gestionar el directorio de proveedores."
      />
    </div>
  )
}
