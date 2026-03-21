-- [TRACED:FD-005] Multi-company isolation via RLS
-- [TRACED:FD-032] FORCE ROW LEVEL SECURITY on ALL tables
-- [TRACED:SEC-001] Row Level Security for all Field Service Dispatch tables
-- FORCE ROW LEVEL SECURITY on ALL tables

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies FORCE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians FORCE ROW LEVEL SECURITY;

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders FORCE ROW LEVEL SECURITY;

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes FORCE ROW LEVEL SECURITY;

ALTER TABLE gps_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_events FORCE ROW LEVEL SECURITY;

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

-- Company isolation policies
CREATE POLICY company_isolation_users ON users
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_customers ON customers
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_technicians ON technicians
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_work_orders ON work_orders
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_routes ON routes
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_invoices ON invoices
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY company_isolation_gps_events ON gps_events
  USING (technician_id IN (
    SELECT id FROM technicians
    WHERE company_id = current_setting('app.current_company_id')::uuid
  ));
