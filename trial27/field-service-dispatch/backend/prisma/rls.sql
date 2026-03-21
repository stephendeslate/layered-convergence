-- [TRACED:FD-001] Row Level Security for multi-tenant field service isolation
-- [TRACED:FD-028] FORCE Row Level Security on ALL 8 tables

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners
ALTER TABLE companies FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;
ALTER TABLE technicians FORCE ROW LEVEL SECURITY;
ALTER TABLE work_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE routes FORCE ROW LEVEL SECURITY;
ALTER TABLE gps_events FORCE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

-- Company isolation: users see only their own company
CREATE POLICY company_isolation ON companies
  USING (id = current_setting('app.current_company_id', true));

-- Users see only users in their company
CREATE POLICY user_company_isolation ON users
  USING (company_id = current_setting('app.current_company_id', true));

-- Customers scoped to company
CREATE POLICY customer_company_isolation ON customers
  USING (company_id = current_setting('app.current_company_id', true));

-- Technicians scoped to company
CREATE POLICY technician_company_isolation ON technicians
  USING (company_id = current_setting('app.current_company_id', true));

-- Work orders scoped to company
CREATE POLICY work_order_company_isolation ON work_orders
  USING (company_id = current_setting('app.current_company_id', true));

-- Routes scoped to company
CREATE POLICY route_company_isolation ON routes
  USING (company_id = current_setting('app.current_company_id', true));

-- GPS events scoped via technician's company
CREATE POLICY gps_event_company_isolation ON gps_events
  USING (technician_id IN (
    SELECT id FROM technicians
    WHERE company_id = current_setting('app.current_company_id', true)
  ));

-- Invoices scoped to company
CREATE POLICY invoice_company_isolation ON invoices
  USING (company_id = current_setting('app.current_company_id', true));
