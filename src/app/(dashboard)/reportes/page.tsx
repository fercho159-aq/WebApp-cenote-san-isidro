import { BarChart3 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function ReportesPage() {
  return (
    <div>
      <PageHeader
        title="Reportes financieros"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={BarChart3}
        title="Reportes financieros"
        description="Esta sección está en desarrollo. Próximamente podrás generar reportes financieros y de ocupación."
      />
    </div>
  )
}
