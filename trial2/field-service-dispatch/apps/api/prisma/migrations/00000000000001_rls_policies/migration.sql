-- Enable Row Level Security on all company-scoped tables

-- Technicians
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY technicians_tenant_isolation ON technicians
  USING ("companyId"::text = current_setting('app.company_id', true))
  WITH CHECK ("companyId"::text = current_setting('app.company_id', true));

-- Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY customers_tenant_isolation ON customers
  USING ("companyId"::text = current_setting('app.company_id', true))
  WITH CHECK ("companyId"::text = current_setting('app.company_id', true));

-- Work Orders
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_orders_tenant_isolation ON work_orders
  USING ("companyId"::text = current_setting('app.company_id', true))
  WITH CHECK ("companyId"::text = current_setting('app.company_id', true));

-- Routes
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY routes_tenant_isolation ON routes
  USING ("companyId"::text = current_setting('app.company_id', true))
  WITH CHECK ("companyId"::text = current_setting('app.company_id', true));

-- Job Photos
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY job_photos_tenant_isolation ON job_photos
  USING ("companyId"::text = current_setting('app.company_id', true))
  WITH CHECK ("companyId"::text = current_setting('app.company_id', true));

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_tenant_isolation ON invoices
  USING ("companyId"::text = current_setting('app.company_id', true))
  WITH CHECK ("companyId"::text = current_setting('app.company_id', true));

-- Work Order Status History
ALTER TABLE work_order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY work_order_status_history_tenant_isolation ON work_order_status_history
  USING ("companyId"::text = current_setting('app.company_id', true))
  WITH CHECK ("companyId"::text = current_setting('app.company_id', true));

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_tenant_isolation ON users
  USING ("companyId"::text = current_setting('app.company_id', true))
  WITH CHECK ("companyId"::text = current_setting('app.company_id', true));
