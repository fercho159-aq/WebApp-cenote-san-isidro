import { Search } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function RegistrosPage() {
  return (
    <div>
      <PageHeader
        title="Control de registros"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={Search}
        title="Control de registros"
        description="Esta sección está en desarrollo. Próximamente podrás consultar el historial de registros y auditoría."
      />
    </div>
  )
}
