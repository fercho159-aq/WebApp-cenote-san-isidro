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
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reservas", href: "/reservaciones", icon: CalendarDays },
  { label: "Cabanas", href: "/cabanas", icon: BedDouble },
  { label: "Punto de venta", href: "/pos", icon: Utensils },
  {
    label: "Housekeeping",
    href: "/cabanas/limpieza",
    icon: Sparkles,
  },
  { label: "Productos", href: "/productos", icon: Package },
  { label: "Registrar gastos", href: "/gastos", icon: DollarSign },
  { label: "Clientes", href: "/huespedes", icon: Users },
  { label: "Proveedores", href: "/proveedores", icon: Building2 },
  { label: "Control diario", href: "/control-diario", icon: ClipboardList },
  { label: "Control de registros", href: "/registros", icon: Search },
  { label: "Reportes financieros", href: "/reportes", icon: BarChart3 },
  { label: "Estadisticas", href: "/estadisticas", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo / name */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            CS
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-white truncate">
              Cenote San Isidro
            </span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="flex flex-col gap-1 px-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;

              const linkContent = (
                <Link
                  href={item.disabled ? "#" : item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-active text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-white",
                    item.disabled &&
                      "pointer-events-none opacity-40",
                    collapsed && "justify-center px-0"
                  )}
                  aria-disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
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

              return (
                <div key={item.href}>{linkContent}</div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-12 items-center justify-center border-t border-white/10 text-sidebar-foreground transition-colors hover:bg-sidebar-hover hover:text-white"
          aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
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
