-- RLS Policies for Field Service Dispatch [VERIFY:RLS]
-- Defense-in-depth: Prisma connects as DB owner, bypasses RLS.
-- Primary isolation is application-level WHERE companyId clauses.

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_isolation_technicians ON technicians
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE POLICY company_isolation_customers ON customers
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE POLICY company_isolation_work_orders ON work_orders
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE POLICY company_isolation_status_history ON work_order_status_history
  USING (work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = current_setting('app.current_company_id', true)::uuid
  ));

CREATE POLICY company_isolation_routes ON routes
  USING (technician_id IN (
    SELECT id FROM technicians WHERE company_id = current_setting('app.current_company_id', true)::uuid
  ));

CREATE POLICY company_isolation_photos ON job_photos
  USING (work_order_id IN (
    SELECT id FROM work_orders WHERE company_id = current_setting('app.current_company_id', true)::uuid
  ));

CREATE POLICY company_isolation_invoices ON invoices
  USING (company_id = current_setting('app.current_company_id', true)::uuid);
