import { TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function EstadisticasPage() {
  return (
    <div>
      <PageHeader
        title="Estadísticas"
        description="Próximamente — esta sección está en desarrollo"
      />
      <EmptyState
        icon={TrendingUp}
        title="Estadísticas"
        description="Esta sección está en desarrollo. Próximamente podrás ver estadísticas de ocupación, ingresos y tendencias."
      />
    </div>
  )
}
