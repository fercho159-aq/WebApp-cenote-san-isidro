-- ============================================
-- Packages / Add-ons for reservations
-- ============================================

-- Package categories (Comida, Acceso al Parque, etc.)
CREATE TABLE IF NOT EXISTS package_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packages (individual items that can be added to a reservation)
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES package_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_type TEXT NOT NULL DEFAULT 'per_reservation' CHECK (price_type IN ('per_person', 'per_night', 'per_reservation', 'per_person_per_night')),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservation packages (junction table: which packages are on which reservation)
CREATE TABLE IF NOT EXISTS reservation_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER set_updated_at_package_categories
  BEFORE UPDATE ON package_categories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_packages
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Seed package categories
INSERT INTO package_categories (name, description, sort_order) VALUES
  ('Acceso al Parque', 'Entradas al cenote y áreas de albercas', 1),
  ('Paquetes de Comida', 'Paquetes de alimentos y bebidas', 2),
  ('Experiencias', 'Actividades y tours especiales', 3)
ON CONFLICT DO NOTHING;

-- Seed packages
INSERT INTO packages (category_id, name, description, price, price_type, sort_order) VALUES
  (
    (SELECT id FROM package_categories WHERE name = 'Acceso al Parque'),
    'Acceso Adulto al Cenote',
    'Entrada de adulto al cenote natural, cenote artificial, toboganes y 2 áreas de albercas',
    200.00,
    'per_person',
    1
  ),
  (
    (SELECT id FROM package_categories WHERE name = 'Acceso al Parque'),
    'Acceso Niño al Cenote',
    'Entrada de niño (4-12 años) al cenote natural, cenote artificial, toboganes y 2 áreas de albercas',
    150.00,
    'per_person',
    2
  ),
  (
    (SELECT id FROM package_categories WHERE name = 'Paquetes de Comida'),
    'Paquete Desayuno',
    'Desayuno típico yucateco para una persona',
    120.00,
    'per_person',
    1
  ),
  (
    (SELECT id FROM package_categories WHERE name = 'Paquetes de Comida'),
    'Paquete Comida Completa',
    'Comida completa con entrada, plato fuerte y bebida',
    250.00,
    'per_person',
    2
  ),
  (
    (SELECT id FROM package_categories WHERE name = 'Paquetes de Comida'),
    'Paquete All Inclusive',
    'Desayuno, comida y cena + bebidas ilimitadas durante la estadía',
    450.00,
    'per_person_per_night',
    3
  ),
  (
    (SELECT id FROM package_categories WHERE name = 'Experiencias'),
    'Tour Guiado al Cenote',
    'Recorrido guiado por el cenote natural con explicación histórica',
    150.00,
    'per_person',
    1
  ),
  (
    (SELECT id FROM package_categories WHERE name = 'Experiencias'),
    'Noche de Fogata',
    'Fogata nocturna con marshmallows y música en vivo',
    500.00,
    'per_reservation',
    2
  )
ON CONFLICT DO NOTHING;
