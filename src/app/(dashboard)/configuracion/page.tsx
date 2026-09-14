import { Settings } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function ConfiguracionPage() {
  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={Settings}
        title="Configuración"
        description="Esta sección está en desarrollo. Próximamente podrás configurar propiedad, usuarios e impuestos."
      />
    </div>
  )
}
