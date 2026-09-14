import { Utensils } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function PosPage() {
  return (
    <div>
      <PageHeader
        title="Punto de venta"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={Utensils}
        title="Punto de venta"
        description="Esta sección está en desarrollo. Próximamente podrás registrar ventas directas y cargos a habitación."
      />
    </div>
  )
}
