// ---- Enums as union types ----

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'
  | 'no_show'

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other'

export type BookingChannel =
  | 'direct'
  | 'booking_engine'
  | 'airbnb'
  | 'booking_com'
  | 'expedia'
  | 'phone'
  | 'walk_in'
  | 'other'

export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'blocked'

export type CleaningStatus = 'clean' | 'dirty' | 'in_progress'

export type UserRole = 'admin' | 'manager' | 'receptionist' | 'housekeeper'

export type DiscountType = 'percentage' | 'fixed'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

// ---- Database types ----

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  phone: string | null
  is_active: boolean
}

export interface RoomCategory {
  id: string
  name: string
  description: string | null
  base_price: number
  max_adults: number
  max_children: number
  amenities: string[]
  sort_order: number
}

export interface Room {
  id: string
  name: string
  category_id: string
  status: RoomStatus
  cleaning_status: CleaningStatus
  notes: string | null
  sort_order: number
  // Relations
  category?: RoomCategory
}

export interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  id_document_type: string | null
  id_document_number: string | null
  nationality: string | null
  country: string | null
  state: string | null
  city: string | null
  address: string | null
  photo_url: string | null
  notes: string | null
  total_stays: number
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: string
  reservation_number: string
  guest_id: string
  room_id: string
  group_id: string | null
  check_in_date: string
  check_out_date: string
  actual_check_in: string | null
  actual_check_out: string | null
  nights: number
  adults: number
  children: number
  status: ReservationStatus
  payment_status: PaymentStatus
  booking_channel: BookingChannel
  channel_reference: string | null
  nightly_rate: number
  discount_type: DiscountType | null
  discount_value: number | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  amount_paid: number
  balance_due: number
  notes: string | null
  internal_notes: string | null
  created_by: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  // Relations
  guest?: Guest
  room?: Room
}

export interface Payment {
  id: string
  reservation_id: string
  amount: number
  payment_method: PaymentMethod
  reference: string | null
  notes: string | null
  received_by: string | null
  cash_register_id: string | null
  created_at: string
  // Relations
  reservation?: Reservation
}

export interface Charge {
  id: string
  reservation_id: string
  description: string
  amount: number
  quantity: number
  total: number
  created_by: string | null
  created_at: string
  // Relations
  reservation?: Reservation
}

export interface Task {
  id: string
  title: string
  description: string | null
  room_id: string | null
  assigned_to: string | null
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  completed_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  room?: Room
  assignee?: Profile
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  all_day: boolean
  color: string | null
  created_by: string | null
  created_at: string
}

export interface CashRegister {
  id: string
  opened_by: string
  closed_by: string | null
  opening_amount: number
  closing_amount: number | null
  expected_amount: number | null
  difference: number | null
  notes: string | null
  opened_at: string
  closed_at: string | null
  // Relations
  opener?: Profile
  closer?: Profile
}
