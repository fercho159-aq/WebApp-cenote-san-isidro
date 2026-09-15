-- ============================================================
-- Products & Point of Sale (POS) tables
-- ============================================================

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  sku TEXT,
  track_inventory BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POS sales (tickets / receipts)
CREATE TABLE IF NOT EXISTS pos_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number TEXT NOT NULL UNIQUE,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash','card','transfer','other')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','voided')),
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- POS sale line items
CREATE TABLE IF NOT EXISTS pos_sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES pos_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_pos_sales_created ON pos_sales(created_at DESC);
CREATE INDEX idx_pos_sales_status ON pos_sales(status);
CREATE INDEX idx_pos_sale_items_sale ON pos_sale_items(sale_id);

-- Sale number generator (VTA-YYMM-NNNN)
CREATE OR REPLACE FUNCTION generate_sale_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  seq INT;
BEGIN
  prefix := 'VTA-' || to_char(now(), 'YYMM') || '-';
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(sale_number FROM length(prefix) + 1) AS INT)
  ), 0) + 1
  INTO seq
  FROM pos_sales
  WHERE sale_number LIKE prefix || '%';
  RETURN prefix || lpad(seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Seed product categories
-- ============================================================
INSERT INTO product_categories (name, description, sort_order) VALUES
  ('Bebidas',   'Refrescos, aguas, jugos, cerveza, licores', 1),
  ('Alimentos', 'Snacks, platillos, postres',                2),
  ('Pasadia',   'Entradas y pases de dia',                   3),
  ('Servicio',  'Servicios adicionales (kayak, tour, etc.)', 4),
  ('Extra',     'Articulos varios y miscelaneos',            5);
