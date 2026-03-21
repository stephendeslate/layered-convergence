-- Enable RLS on all company-scoped tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gps_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant isolation
CREATE POLICY "users_company_isolation" ON "users"
  USING (company_id = current_setting('app.company_id', true));

CREATE POLICY "customers_company_isolation" ON "customers"
  USING (company_id = current_setting('app.company_id', true));

CREATE POLICY "technicians_company_isolation" ON "technicians"
  USING (company_id = current_setting('app.company_id', true));

CREATE POLICY "work_orders_company_isolation" ON "work_orders"
  USING (company_id = current_setting('app.company_id', true));

CREATE POLICY "routes_company_isolation" ON "routes"
  USING (company_id = current_setting('app.company_id', true));

CREATE POLICY "gps_events_company_isolation" ON "gps_events"
  USING (company_id = current_setting('app.company_id', true));

CREATE POLICY "invoices_company_isolation" ON "invoices"
  USING (company_id = current_setting('app.company_id', true));
