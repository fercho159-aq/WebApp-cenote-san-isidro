"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Utensils,
  Sparkles,
  Package,
  DollarSign,
  Users,
  Building2,
  ClipboardList,
  Search,
  BarChart3,
  TrendingUp,
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reservas", href: "/reservaciones", icon: CalendarDays },
  { label: "Cabañas", href: "/cabanas", icon: BedDouble },
  { label: "Punto de venta", href: "/pos", icon: Utensils },
  { label: "Housekeeping", href: "/cabanas/limpieza", icon: Sparkles, badge: "Nuevo" },
  { label: "Productos", href: "/productos", icon: Package },
  { label: "Registrar gastos", href: "/gastos", icon: DollarSign },
  { label: "Clientes", href: "/huespedes", icon: Users },
  { label: "Proveedores", href: "/proveedores", icon: Building2 },
  { label: "Control diario", href: "/control-diario", icon: ClipboardList },
  { label: "Control de registros", href: "/registros", icon: Search },
  { label: "Reportes financieros", href: "/reportes", icon: BarChart3 },
  { label: "Estadísticas", href: "/estadisticas", icon: TrendingUp },
  { label: "Configuraciones", href: "/configuracion", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo / property name */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            CS
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground truncate">
              Cenote San Isidro
            </span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-active text-sidebar-active-text"
                      : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.href}>{linkContent}</div>;
            })}
          </nav>
        </ScrollArea>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-foreground transition-colors hover:bg-sidebar-hover hover:text-foreground"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </TooltipProvider>
  );
}
