"use client";

import { usePathname } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Badge } from "@/components/ui/badge";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reservaciones": "Reservas",
  "/pos": "Punto de venta",
  "/cabanas/limpieza": "Housekeeping",
  "/productos": "Productos",
  "/gastos": "Registrar gastos",
  "/huespedes": "Clientes",
  "/proveedores": "Proveedores",
  "/control-diario": "Control diario",
  "/registros": "Control de registros",
  "/reportes": "Reportes financieros",
  "/estadisticas": "Estadisticas",
  "/configuracion": "Configuracion",
};

function getPageTitle(pathname: string): string {
  // Check for exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check for prefix match
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title;
  }

  return "Dashboard";
}

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="hidden sm:inline-flex">
          Caja activa: Recepcion
        </Badge>

        <div className="relative group">
          <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline-block max-w-[150px] truncate">
              {userEmail ?? "Admin"}
            </span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-1 hidden w-48 rounded-lg border border-border bg-popover p-1 shadow-lg group-hover:block">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
