-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry columns for spatial queries
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- Create spatial indexes
CREATE INDEX IF NOT EXISTS idx_technicians_location ON technicians USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_work_orders_location ON work_orders USING GIST (location);

-- Function to auto-update geometry from lat/lng on technicians
CREATE OR REPLACE FUNCTION update_technician_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."currentLat" IS NOT NULL AND NEW."currentLng" IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW."currentLng", NEW."currentLat"), 4326);
  ELSE
    NEW.location = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_technician_location
  BEFORE INSERT OR UPDATE OF "currentLat", "currentLng" ON technicians
  FOR EACH ROW
  EXECUTE FUNCTION update_technician_location();

-- Function to auto-update geometry from lat/lng on work_orders
CREATE OR REPLACE FUNCTION update_work_order_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  ELSE
    NEW.location = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_work_order_location
  BEFORE INSERT OR UPDATE OF lat, lng ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_work_order_location();

-- Function to auto-update geometry from lat/lng on customers
CREATE OR REPLACE FUNCTION update_customer_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  ELSE
    NEW.location = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_customer_location
  BEFORE INSERT OR UPDATE OF lat, lng ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_location();
