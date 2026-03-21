-- [TRACED:SEC-001] Enable Row Level Security on all company-scoped tables with FORCE
-- Run after Prisma migrations

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

-- [TRACED:SEC-002] RLS policies enforce companyId-based isolation
CREATE POLICY company_isolation ON companies
  USING ("id" = current_setting('app.company_id', true));

CREATE POLICY user_company_isolation ON users
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY customer_company_isolation ON customers
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY technician_company_isolation ON technicians
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY work_order_company_isolation ON work_orders
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY route_company_isolation ON routes
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY gps_event_company_isolation ON gps_events
  USING ("company_id" = current_setting('app.company_id', true));

CREATE POLICY invoice_company_isolation ON invoices
  USING ("company_id" = current_setting('app.company_id', true));
