-- Aqua Flow System normalized PostgreSQL schema.
-- Run with a migration tool or: psql "$DATABASE_URL" -f backend/sql/001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS farm_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE,
  name text NOT NULL,
  role text NOT NULL,
  mobile text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ponds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  area_m2 numeric(12,2),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS fish_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_no text NOT NULL UNIQUE,
  fish_name text NOT NULL,
  nursery_weight_kg numeric(14,3) NOT NULL DEFAULT 0 CHECK (nursery_weight_kg >= 0),
  nursery_fish_count integer NOT NULL DEFAULT 0 CHECK (nursery_fish_count >= 0),
  nursery_date date,
  status text NOT NULL DEFAULT 'nursery-pending',
  stage text NOT NULL DEFAULT 'Fry (Nursery)',
  note text,
  source_sheet text,
  source_row_number integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  UNIQUE (source_sheet, source_row_number)
);

CREATE TABLE IF NOT EXISTS cycle_pond_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES fish_cycles(id) ON DELETE CASCADE,
  pond_id uuid NOT NULL REFERENCES ponds(id),
  shifted_at date NOT NULL,
  weight_kg numeric(14,3) NOT NULL DEFAULT 0 CHECK (weight_kg >= 0),
  fish_count integer NOT NULL DEFAULT 0 CHECK (fish_count >= 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  UNIQUE (cycle_id, pond_id, shifted_at)
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL,
  current_stock numeric(14,3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  purchase_quantity numeric(14,3) NOT NULL DEFAULT 0 CHECK (purchase_quantity >= 0),
  min_threshold numeric(14,3) NOT NULL DEFAULT 0 CHECK (min_threshold >= 0),
  cost_per_unit numeric(14,4) NOT NULL DEFAULT 0 CHECK (cost_per_unit >= 0),
  supplier_name text,
  supplier_mobile text,
  expiry_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_no text NOT NULL UNIQUE,
  purchase_type text NOT NULL,
  vendor_name text NOT NULL,
  vendor_mobile text,
  invoice_reference text,
  delivery_status text NOT NULL DEFAULT 'Received',
  tax_rate numeric(6,3) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
  freight_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (freight_amount >= 0),
  total_amount numeric(14,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  attachment_url text,
  notes text,
  ordered_at date,
  source_sheet text,
  source_row_number integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  UNIQUE (source_sheet, source_row_number)
);

CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id uuid REFERENCES inventory_items(id),
  fish_name text,
  quantity numeric(14,3) NOT NULL CHECK (quantity >= 0),
  unit text NOT NULL,
  unit_price numeric(14,4) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  initial_weight_kg numeric(14,3) CHECK (initial_weight_kg >= 0),
  fish_count integer CHECK (fish_count >= 0),
  line_total numeric(14,2) NOT NULL DEFAULT 0 CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS farm_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_no text NOT NULL UNIQUE,
  expense_type text NOT NULL,
  pond_area text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  expense_date date NOT NULL,
  notes text,
  cycle_id uuid REFERENCES fish_cycles(id),
  source_sheet text,
  source_row_number integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  UNIQUE (source_sheet, source_row_number)
);

CREATE TABLE IF NOT EXISTS feed_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pond_id uuid REFERENCES ponds(id),
  pond_name text,
  inventory_item_id uuid REFERENCES inventory_items(id),
  fed_at timestamptz NOT NULL,
  quantity_kg numeric(14,3) NOT NULL CHECK (quantity_kg > 0),
  technician text,
  response text,
  notes text,
  source_sheet text,
  source_row_number integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  UNIQUE (source_sheet, source_row_number)
);

ALTER TABLE feed_logs ADD COLUMN IF NOT EXISTS pond_name text;

CREATE TABLE IF NOT EXISTS harvest_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_no text NOT NULL UNIQUE,
  cycle_id uuid REFERENCES fish_cycles(id),
  fish_name text NOT NULL,
  harvest_weight_kg numeric(14,3) NOT NULL CHECK (harvest_weight_kg >= 0),
  estimated_fish_count integer NOT NULL DEFAULT 0 CHECK (estimated_fish_count >= 0),
  selling_price_per_kg numeric(14,4) NOT NULL CHECK (selling_price_per_kg >= 0),
  buyer_name text NOT NULL,
  buyer_mobile text,
  harvest_netting_cost numeric(14,2) NOT NULL DEFAULT 0 CHECK (harvest_netting_cost >= 0),
  sold_at date NOT NULL,
  source_sheet text,
  source_row_number integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1,
  UNIQUE (source_sheet, source_row_number)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id bigserial PRIMARY KEY,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  actor_id uuid REFERENCES farm_users(id),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cycles_status_updated ON fish_cycles (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_allocations_cycle_date ON cycle_pond_allocations (cycle_id, shifted_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_category_stock ON inventory_items (category, current_stock);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders (ordered_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_lines_item ON purchase_order_lines (inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date_cycle ON farm_expenses (expense_date DESC, cycle_id);
CREATE INDEX IF NOT EXISTS idx_feed_logs_pond_time ON feed_logs (pond_id, fed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_cycle_date ON harvest_sales (cycle_id, sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_buyer_date ON harvest_sales (buyer_name, sold_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity_created ON audit_events (entity_type, entity_id, created_at DESC);
