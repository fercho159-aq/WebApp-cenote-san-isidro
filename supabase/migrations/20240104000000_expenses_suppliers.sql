-- ============================================================================
-- Cenote San Isidro - Expenses & Suppliers
-- ============================================================================

-- ============================================================================
-- TABLE: suppliers
-- ============================================================================
CREATE TABLE public.suppliers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  contact_name  TEXT,
  phone         TEXT,
  email         TEXT,
  rfc           TEXT,
  address       TEXT,
  notes         TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_suppliers_name ON public.suppliers (name);

CREATE TRIGGER set_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TABLE: expense_categories
-- ============================================================================
CREATE TABLE public.expense_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  description   TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_expense_categories_updated_at
  BEFORE UPDATE ON public.expense_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Seed expense categories
INSERT INTO public.expense_categories (name, description, sort_order) VALUES
  ('Mantenimiento',  'Reparaciones y mantenimiento de instalaciones',  1),
  ('Servicios',      'Agua, luz, internet y otros servicios',          2),
  ('Nomina',         'Sueldos y prestaciones del personal',            3),
  ('Insumos',        'Materiales y suministros operativos',            4),
  ('Limpieza',       'Productos y servicios de limpieza',              5),
  ('Marketing',      'Publicidad, redes sociales y promociones',       6);

-- ============================================================================
-- TABLE: expenses
-- ============================================================================
CREATE TABLE public.expenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES public.expense_categories(id) ON DELETE RESTRICT,
  supplier_id     UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  description     TEXT NOT NULL,
  amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  expense_date    DATE NOT NULL,
  payment_method  TEXT CHECK (payment_method IN ('cash', 'card', 'transfer', 'other')),
  reference       TEXT,
  notes           TEXT,
  created_by      UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON public.expenses (expense_date);
CREATE INDEX idx_expenses_category ON public.expenses (category_id);
CREATE INDEX idx_expenses_supplier ON public.expenses (supplier_id) WHERE supplier_id IS NOT NULL;

CREATE TRIGGER set_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
