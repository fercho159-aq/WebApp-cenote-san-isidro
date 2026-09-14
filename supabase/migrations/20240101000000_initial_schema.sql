-- ============================================================================
-- Cenote San Isidro - Property Management System
-- Database Schema for Neon PostgreSQL
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- TABLE: users (application users with password auth)
-- ============================================================================
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'employee'
                CHECK (role IN ('admin', 'employee')),
  avatar_url    TEXT,
  phone         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Application users with credentials';

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TABLE: room_categories
-- ============================================================================
CREATE TABLE public.room_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  base_price    NUMERIC(10, 2) NOT NULL,
  max_adults    INT NOT NULL DEFAULT 2,
  max_children  INT NOT NULL DEFAULT 2,
  amenities     JSONB DEFAULT '[]'::jsonb,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_room_categories_updated_at
  BEFORE UPDATE ON public.room_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TABLE: rooms (12 cabañas)
-- ============================================================================
CREATE TABLE public.rooms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL UNIQUE,
  category_id     UUID NOT NULL REFERENCES public.room_categories(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available', 'occupied', 'maintenance', 'blocked')),
  cleaning_status TEXT NOT NULL DEFAULT 'clean'
                  CHECK (cleaning_status IN ('clean', 'dirty', 'in_progress')),
  notes           TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TABLE: guests
-- ============================================================================
CREATE TABLE public.guests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT,
  phone               TEXT,
  id_document_type    TEXT CHECK (id_document_type IN ('INE', 'passport', 'license', 'other')),
  id_document_number  TEXT,
  nationality         TEXT,
  country             TEXT,
  state               TEXT,
  city                TEXT,
  address             TEXT,
  photo_url           TEXT,
  notes               TEXT,
  total_stays         INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guests_name ON public.guests (last_name, first_name);
CREATE INDEX idx_guests_email ON public.guests (email) WHERE email IS NOT NULL;
CREATE INDEX idx_guests_phone ON public.guests (phone) WHERE phone IS NOT NULL;

CREATE TRIGGER set_guests_updated_at
  BEFORE UPDATE ON public.guests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TABLE: reservation_groups
-- ============================================================================
CREATE TABLE public.reservation_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_reservation_groups_updated_at
  BEFORE UPDATE ON public.reservation_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TABLE: reservations
-- ============================================================================
CREATE TABLE public.reservations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number    TEXT NOT NULL UNIQUE,
  guest_id              UUID NOT NULL REFERENCES public.guests(id) ON DELETE RESTRICT,
  room_id               UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  group_id              UUID REFERENCES public.reservation_groups(id) ON DELETE SET NULL,

  check_in_date         DATE NOT NULL,
  check_out_date        DATE NOT NULL,
  actual_check_in       TIMESTAMPTZ,
  actual_check_out      TIMESTAMPTZ,
  nights                INT GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,

  adults                INT NOT NULL DEFAULT 1,
  children              INT NOT NULL DEFAULT 0,

  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show')),
  payment_status        TEXT NOT NULL DEFAULT 'unpaid'
                        CHECK (payment_status IN ('unpaid', 'partial', 'paid')),

  booking_channel       TEXT NOT NULL DEFAULT 'direct'
                        CHECK (booking_channel IN ('direct', 'booking_engine', 'airbnb', 'booking_com', 'expedia', 'phone', 'walk_in', 'other')),
  channel_reference     TEXT,

  nightly_rate          NUMERIC(10, 2) NOT NULL,
  discount_type         TEXT,
  discount_value        NUMERIC(10, 2),
  subtotal              NUMERIC(10, 2) NOT NULL,
  tax_rate              NUMERIC(5, 4) NOT NULL DEFAULT 0.16,
  tax_amount            NUMERIC(10, 2) NOT NULL,
  total                 NUMERIC(10, 2) NOT NULL,

  amount_paid           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  balance_due           NUMERIC(10, 2) GENERATED ALWAYS AS (total - amount_paid) STORED,

  notes                 TEXT,
  internal_notes        TEXT,

  created_by            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cancelled_at          TIMESTAMPTZ,
  cancellation_reason   TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_adults CHECK (adults >= 1)
);

CREATE INDEX idx_reservations_dates ON public.reservations (check_in_date, check_out_date);
CREATE INDEX idx_reservations_room_dates ON public.reservations (room_id, check_in_date, check_out_date);
CREATE INDEX idx_reservations_guest ON public.reservations (guest_id);
CREATE INDEX idx_reservations_status ON public.reservations (status);

CREATE TRIGGER set_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- FUNCTION: generate_reservation_number() — RES-YYYYMMDD-NNN
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_reservation_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  today_str TEXT;
  seq_num   INT;
BEGIN
  today_str := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.reservations
  WHERE reservation_number LIKE 'RES-' || today_str || '-%';
  NEW.reservation_number := 'RES-' || today_str || '-' || LPAD(seq_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_reservation_number
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  WHEN (NEW.reservation_number IS NULL OR NEW.reservation_number = '')
  EXECUTE FUNCTION public.generate_reservation_number();

-- ============================================================================
-- FUNCTION: check_room_availability() — prevents double-booking
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_room_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IN ('cancelled', 'no_show') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.reservations
    WHERE room_id = NEW.room_id
      AND id != COALESCE(NEW.id, gen_random_uuid())
      AND status NOT IN ('cancelled', 'no_show')
      AND daterange(check_in_date, check_out_date) && daterange(NEW.check_in_date, NEW.check_out_date)
  ) THEN
    RAISE EXCEPTION 'La habitación no está disponible para las fechas seleccionadas.';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_availability_before_reservation
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_room_availability();

-- ============================================================================
-- TABLE: reservation_guests
-- ============================================================================
CREATE TABLE public.reservation_guests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  guest_id        UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  relationship    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reservation_id, guest_id)
);

-- ============================================================================
-- TABLE: payments
-- ============================================================================
CREATE TABLE public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id    UUID NOT NULL REFERENCES public.reservations(id) ON DELETE RESTRICT,
  guest_id          UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  amount            NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  payment_method    TEXT NOT NULL
                    CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
  reference_number  TEXT,
  notes             TEXT,
  voided            BOOLEAN NOT NULL DEFAULT false,
  voided_at         TIMESTAMPTZ,
  voided_reason     TEXT,
  created_by        UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_reservation ON public.payments (reservation_id);

-- ============================================================================
-- FUNCTION: update_reservation_amount_paid()
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_reservation_amount_paid()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  res_id      UUID;
  total_paid  NUMERIC(10, 2);
  res_total   NUMERIC(10, 2);
BEGIN
  IF TG_OP = 'DELETE' THEN
    res_id := OLD.reservation_id;
  ELSE
    res_id := NEW.reservation_id;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM public.payments
  WHERE reservation_id = res_id AND voided = false;

  SELECT total INTO res_total
  FROM public.reservations
  WHERE id = res_id;

  UPDATE public.reservations
  SET amount_paid = total_paid,
      payment_status = CASE
        WHEN total_paid = 0 THEN 'unpaid'
        WHEN total_paid >= res_total THEN 'paid'
        ELSE 'partial'
      END
  WHERE id = res_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_payment_to_reservation
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reservation_amount_paid();

-- ============================================================================
-- TABLE: charges
-- ============================================================================
CREATE TABLE public.charges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES public.reservations(id) ON DELETE RESTRICT,
  product_id      UUID,
  description     TEXT NOT NULL,
  quantity        INT NOT NULL DEFAULT 1,
  unit_price      NUMERIC(10, 2) NOT NULL,
  total           NUMERIC(10, 2) NOT NULL,
  voided          BOOLEAN NOT NULL DEFAULT false,
  voided_at       TIMESTAMPTZ,
  voided_reason   TEXT,
  charged_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_charges_reservation ON public.charges (reservation_id);

-- ============================================================================
-- TABLE: refunds
-- ============================================================================
CREATE TABLE public.refunds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  reservation_id  UUID NOT NULL REFERENCES public.reservations(id) ON DELETE RESTRICT,
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  reason          TEXT,
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: tasks
-- ============================================================================
CREATE TABLE public.tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  assigned_to   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  due_date      DATE,
  priority      TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TABLE: calendar_events
-- ============================================================================
CREATE TABLE public.calendar_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  type        TEXT NOT NULL DEFAULT 'note'
              CHECK (type IN ('holiday', 'event', 'note', 'high_season', 'maintenance')),
  color       TEXT,
  created_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TABLE: audit_log
-- ============================================================================
CREATE TABLE public.audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_entity ON public.audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_log_user ON public.audit_log (user_id);
CREATE INDEX idx_audit_log_created ON public.audit_log (created_at);

-- ============================================================================
-- FUNCTION: get_dashboard_stats()
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSONB;
  today  DATE := CURRENT_DATE;
BEGIN
  SELECT jsonb_build_object(
    'today', today,
    'arrivals_today', (SELECT COUNT(*) FROM public.reservations WHERE check_in_date = today AND status IN ('confirmed', 'pending')),
    'departures_today', (SELECT COUNT(*) FROM public.reservations WHERE check_out_date = today AND status = 'checked_in'),
    'occupied_rooms', (SELECT COUNT(*) FROM public.reservations WHERE status = 'checked_in'),
    'total_rooms', (SELECT COUNT(*) FROM public.rooms WHERE status != 'blocked'),
    'available_rooms', (SELECT COUNT(*) FROM public.rooms WHERE status = 'available' AND id NOT IN (SELECT room_id FROM public.reservations WHERE status IN ('confirmed', 'checked_in') AND check_in_date <= today AND check_out_date > today)),
    'income_today', (SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE created_at::DATE = today AND voided = false),
    'rooms_dirty', (SELECT COUNT(*) FROM public.rooms WHERE cleaning_status = 'dirty'),
    'pending_tasks', (SELECT COUNT(*) FROM public.tasks WHERE status IN ('pending', 'in_progress'))
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================================
-- FUNCTION: get_occupancy(start_date, end_date)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_occupancy(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (date DATE, total_rooms INT, occupied_rooms INT, occupancy_rate NUMERIC(5,2))
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  total INT;
BEGIN
  SELECT COUNT(*) INTO total FROM public.rooms WHERE status != 'blocked';
  RETURN QUERY
  SELECT
    d.date::DATE,
    total,
    COALESCE((SELECT COUNT(DISTINCT r.room_id) FROM public.reservations r WHERE r.status IN ('confirmed', 'checked_in') AND r.check_in_date <= d.date AND r.check_out_date > d.date), 0)::INT,
    ROUND(COALESCE((SELECT COUNT(DISTINCT r.room_id) FROM public.reservations r WHERE r.status IN ('confirmed', 'checked_in') AND r.check_in_date <= d.date AND r.check_out_date > d.date), 0)::NUMERIC / NULLIF(total, 0) * 100, 2)
  FROM generate_series(p_start_date, p_end_date, INTERVAL '1 day') AS d(date)
  ORDER BY d.date;
END;
$$;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Room Categories
INSERT INTO public.room_categories (id, name, description, base_price, max_adults, max_children, amenities, sort_order)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Estándar', 'Cabaña estándar con todas las comodidades básicas.', 1500.00, 5, 2, '["Aire acondicionado", "Baño privado", "Wi-Fi", "Ventilador", "Ropa de cama"]'::jsonb, 1),
  ('11111111-1111-1111-1111-111111111102', 'Superior', 'Cabaña superior con amenidades adicionales y vista al cenote.', 2200.00, 5, 2, '["Aire acondicionado", "Baño privado", "Wi-Fi", "Ventilador", "Ropa de cama", "Mini refrigerador", "Terraza privada"]'::jsonb, 2),
  ('11111111-1111-1111-1111-111111111103', 'Deluxe', 'Cabaña deluxe premium con ubicación privilegiada junto al cenote.', 3350.00, 5, 2, '["Aire acondicionado", "Baño privado", "Wi-Fi", "Ventilador", "Ropa de cama", "Mini refrigerador", "Terraza privada", "Hamaca", "Sala de estar"]'::jsonb, 3);

-- 12 Cabañas
INSERT INTO public.rooms (name, category_id, status, cleaning_status, sort_order) VALUES
  ('Naluum',        '11111111-1111-1111-1111-111111111101', 'available', 'clean', 1),
  ('Quetzalli',     '11111111-1111-1111-1111-111111111101', 'available', 'clean', 2),
  ('Kiim',          '11111111-1111-1111-1111-111111111101', 'available', 'clean', 3),
  ('Lolha',         '11111111-1111-1111-1111-111111111101', 'available', 'clean', 4),
  ('Mestiza',       '11111111-1111-1111-1111-111111111102', 'available', 'clean', 5),
  ('Yatzil',        '11111111-1111-1111-1111-111111111102', 'available', 'clean', 6),
  ('Itzel',         '11111111-1111-1111-1111-111111111102', 'available', 'clean', 7),
  ('Zach',          '11111111-1111-1111-1111-111111111102', 'available', 'clean', 8),
  ('Lolbe',         '11111111-1111-1111-1111-111111111103', 'available', 'clean', 9),
  ('Kanlol',        '11111111-1111-1111-1111-111111111103', 'available', 'clean', 10),
  ('Beek',          '11111111-1111-1111-1111-111111111103', 'available', 'clean', 11),
  ('Casa del Arbol','11111111-1111-1111-1111-111111111103', 'available', 'clean', 12);

-- Días festivos México 2026
INSERT INTO public.calendar_events (title, description, start_date, end_date, type, color) VALUES
  ('Día de la Independencia', 'Celebración del Día de la Independencia de México', '2026-09-16', '2026-09-16', 'holiday', '#006847'),
  ('Día de la Revolución', 'Conmemoración de la Revolución Mexicana', '2026-11-16', '2026-11-16', 'holiday', '#006847'),
  ('Día de la Virgen de Guadalupe', 'Festividad de la Virgen de Guadalupe', '2026-12-12', '2026-12-12', 'holiday', '#CE1126'),
  ('Navidad', 'Celebración de Navidad', '2026-12-25', '2026-12-25', 'holiday', '#CE1126');

-- Admin user (password: CenoteAdmin2026!)
INSERT INTO public.users (email, password_hash, full_name, role) VALUES
  ('admin@cenote-san-isidro.com', crypt('CenoteAdmin2026!', gen_salt('bf')), 'Administrador', 'admin');
