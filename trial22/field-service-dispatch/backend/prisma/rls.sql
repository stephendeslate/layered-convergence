-- TRACED:PV-003 Company-scoped data with RLS
-- TRACED:SA-003 Row-level security on company-scoped tables
-- TRACED:SEC-005 RLS on all company-scoped tables

-- Enable RLS on all company-scoped tables
-- FORCE ensures RLS applies even to table owners

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians FORCE ROW LEVEL SECURITY;

ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders FORCE ROW LEVEL SECURITY;

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes FORCE ROW LEVEL SECURITY;

ALTER TABLE gps_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_events FORCE ROW LEVEL SECURITY;

-- RLS policies: filter by company_id matching session variable

CREATE POLICY users_company_isolation ON users
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY customers_company_isolation ON customers
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY technicians_company_isolation ON technicians
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY work_orders_company_isolation ON work_orders
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY invoices_company_isolation ON invoices
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY routes_company_isolation ON routes
  USING (company_id = current_setting('app.current_company_id')::uuid);

CREATE POLICY gps_events_company_isolation ON gps_events
  USING (company_id = current_setting('app.current_company_id')::uuid);
