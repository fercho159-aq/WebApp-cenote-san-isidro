import { DollarSign } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function GastosPage() {
  return (
    <div>
      <PageHeader
        title="Registrar gastos"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={DollarSign}
        title="Registrar gastos"
        description="Esta sección está en desarrollo. Próximamente podrás registrar y categorizar gastos operativos."
      />
    </div>
  )
}
