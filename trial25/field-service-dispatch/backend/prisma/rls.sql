-- [TRACED:SEC-005] Row Level Security on all 8 tables
-- [TRACED:SEC-006] FORCE ROW LEVEL SECURITY on all tables

-- Companies: users can only see their own company
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies FORCE ROW LEVEL SECURITY;
CREATE POLICY company_isolation ON companies
  USING (id IN (
    SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
  ));

-- Users: scoped to company
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY user_company_isolation ON users
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
  ));

-- Customers: scoped to company
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
CREATE POLICY customer_company_isolation ON customers
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
  ));

-- Technicians: scoped to company
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians FORCE ROW LEVEL SECURITY;
CREATE POLICY technician_company_isolation ON technicians
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
  ));

-- Work Orders: scoped to company
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders FORCE ROW LEVEL SECURITY;
CREATE POLICY work_order_company_isolation ON work_orders
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
  ));

-- Routes: scoped to company
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes FORCE ROW LEVEL SECURITY;
CREATE POLICY route_company_isolation ON routes
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
  ));

-- GPS Events: scoped to company via technician
ALTER TABLE gps_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_events FORCE ROW LEVEL SECURITY;
CREATE POLICY gps_event_company_isolation ON gps_events
  USING (technician_id IN (
    SELECT id FROM technicians WHERE company_id IN (
      SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
    )
  ));

-- Invoices: scoped to company
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;
CREATE POLICY invoice_company_isolation ON invoices
  USING (company_id IN (
    SELECT company_id FROM users WHERE id = current_setting('app.user_id', true)::uuid
  ));
