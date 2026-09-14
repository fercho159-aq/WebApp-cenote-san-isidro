"use client";

import { usePathname } from "next/navigation";
import { LogOut, User, Bell, Search } from "lucide-react";
import { signOut } from "@/actions/auth";

const pageTitles: Record<string, string> = {
  "/dashboard": "Panel de control",
  "/reservaciones": "Reservas",
  "/pos": "Punto de venta",
  "/cabanas/limpieza": "Housekeeping",
  "/cabanas": "Cabañas",
  "/productos": "Productos",
  "/gastos": "Registrar gastos",
  "/huespedes": "Clientes",
  "/proveedores": "Proveedores",
  "/control-diario": "Control diario",
  "/registros": "Control de registros",
  "/reportes": "Reportes financieros",
  "/estadisticas": "Estadísticas",
  "/configuracion": "Configuraciones",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title;
  }
  return "Panel de control";
}

interface HeaderProps {
  userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Cash register info */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Caja activa</span>
            <span className="font-medium text-foreground">Recepción</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Balance:</span>
            <span className="font-semibold text-foreground">MXN 0.00</span>
          </div>
        </div>

        <div className="h-8 w-px bg-border hidden sm:block" />

        {/* Search */}
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-4 w-4" />
        </button>

        {/* User menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden md:inline-block max-w-[150px] truncate text-foreground text-sm">
              {userEmail ?? "Admin"}
            </span>
          </button>

          <div className="absolute right-0 top-full z-50 mt-1 hidden w-48 rounded-lg border border-border bg-popover p-1 shadow-lg group-hover:block">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
