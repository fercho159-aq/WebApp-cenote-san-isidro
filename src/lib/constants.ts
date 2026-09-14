export const RESERVATION_STATUSES = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  checked_in: 'Check-in',
  checked_out: 'Check-out',
  cancelled: 'Cancelada',
  no_show: 'No show',
} as const

export const PAYMENT_STATUSES = {
  unpaid: 'Sin pagos',
  partial: 'Pagos parciales',
  paid: 'Pagada',
} as const

export const PAYMENT_METHODS = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  other: 'Otro',
} as const

export const BOOKING_CHANNELS = {
  direct: 'Directo',
  booking_engine: 'Booking Engine',
  airbnb: 'Airbnb',
  booking_com: 'Booking.com',
  expedia: 'Expedia',
  phone: 'Teléfono',
  walk_in: 'Walk-in',
  other: 'Otro',
} as const

export const ROOM_STATUSES = {
  available: 'Disponible',
  occupied: 'Ocupada',
  maintenance: 'Mantenimiento',
  blocked: 'Bloqueada',
} as const

export const CLEANING_STATUSES = {
  clean: 'Limpia',
  dirty: 'Sucia',
  in_progress: 'En limpieza',
} as const

export const TAX_RATE = 0.16

export const CURRENCY = 'MXN'

export const NAV_ITEMS = [
  {
    icon: 'LayoutDashboard',
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: 'Calendar',
    label: 'Calendario',
    href: '/dashboard/calendar',
  },
  {
    icon: 'BookOpen',
    label: 'Reservaciones',
    href: '/dashboard/reservations',
  },
  {
    icon: 'BedDouble',
    label: 'Habitaciones',
    href: '/dashboard/rooms',
  },
  {
    icon: 'Users',
    label: 'Huéspedes',
    href: '/dashboard/guests',
  },
  {
    icon: 'DollarSign',
    label: 'Pagos',
    href: '/dashboard/payments',
  },
  {
    icon: 'ClipboardList',
    label: 'Tareas',
    href: '/dashboard/tasks',
  },
  {
    icon: 'BarChart3',
    label: 'Reportes',
    href: '/dashboard/reports',
  },
  {
    icon: 'Settings',
    label: 'Configuración',
    href: '/dashboard/settings',
  },
] as const
