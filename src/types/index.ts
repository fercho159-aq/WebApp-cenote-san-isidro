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
  floor: string | null
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
  reference_number: string | null
  payment_date: string
  notes: string | null
  voided: boolean
  voided_at: string | null
  voided_reason: string | null
  created_by: string | null
  created_at: string
  // Relations
  reservation?: Reservation
}

export interface Charge {
  id: string
  reservation_id: string
  description: string
  amount: number
  charge_type: string | null
  created_by: string | null
  created_at: string
  // Relations
  reservation?: Reservation
}

export interface Refund {
  id: string
  payment_id: string
  amount: number
  reason: string
  created_by: string | null
  created_at: string
  // Relations
  payment?: Payment
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

export interface Supplier {
  id: string
  name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  rfc: string | null
  address: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseCategory {
  id: string
  name: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  category_id: string
  supplier_id: string | null
  description: string
  amount: number
  expense_date: string
  payment_method: string | null
  reference: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Relations
  category?: ExpenseCategory
  supplier?: Supplier
}

// ---- Products & POS ----

export type SaleStatus = 'completed' | 'voided'

export interface ProductCategory {
  id: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  cost: number
  sku: string | null
  track_inventory: boolean
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // Relations
  category?: ProductCategory
}

export interface PosSale {
  id: string
  sale_number: string
  reservation_id: string | null
  payment_method: PaymentMethod
  subtotal: number
  tax_amount: number
  total: number
  status: SaleStatus
  notes: string | null
  created_by: string | null
  created_at: string
  // Relations
  items?: PosSaleItem[]
  reservation?: Reservation
}

export interface PosSaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  // Relations
  product?: Product
}
