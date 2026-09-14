import { ClipboardList } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function ControlDiarioPage() {
  return (
    <div>
      <PageHeader
        title="Control diario"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={ClipboardList}
        title="Control diario"
        description="Esta sección está en desarrollo. Próximamente podrás ver el resumen de turno y control de caja."
      />
    </div>
  )
}
