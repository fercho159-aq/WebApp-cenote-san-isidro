import { Package } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function ProductosPage() {
  return (
    <div>
      <PageHeader
        title="Productos"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={Package}
        title="Productos"
        description="Esta sección está en desarrollo. Próximamente podrás gestionar productos, categorías e inventario."
      />
    </div>
  )
}
