-- TRACED:RLS_FORCE — All company-scoped tables use FORCE ROW LEVEL SECURITY

-- Enable RLS on all company-scoped tables
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

-- RLS Policies for users
CREATE POLICY users_select ON users FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY users_insert ON users FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY users_update ON users FOR UPDATE USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY users_delete ON users FOR DELETE USING (company_id = current_setting('app.company_id')::uuid);

-- RLS Policies for customers
CREATE POLICY customers_select ON customers FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY customers_insert ON customers FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY customers_update ON customers FOR UPDATE USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY customers_delete ON customers FOR DELETE USING (company_id = current_setting('app.company_id')::uuid);

-- RLS Policies for technicians
CREATE POLICY technicians_select ON technicians FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY technicians_insert ON technicians FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY technicians_update ON technicians FOR UPDATE USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY technicians_delete ON technicians FOR DELETE USING (company_id = current_setting('app.company_id')::uuid);

-- RLS Policies for work_orders
CREATE POLICY work_orders_select ON work_orders FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY work_orders_insert ON work_orders FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY work_orders_update ON work_orders FOR UPDATE USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY work_orders_delete ON work_orders FOR DELETE USING (company_id = current_setting('app.company_id')::uuid);

-- RLS Policies for routes
CREATE POLICY routes_select ON routes FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY routes_insert ON routes FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY routes_update ON routes FOR UPDATE USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY routes_delete ON routes FOR DELETE USING (company_id = current_setting('app.company_id')::uuid);

-- RLS Policies for gps_events
CREATE POLICY gps_events_select ON gps_events FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY gps_events_insert ON gps_events FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY gps_events_update ON gps_events FOR UPDATE USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY gps_events_delete ON gps_events FOR DELETE USING (company_id = current_setting('app.company_id')::uuid);

-- RLS Policies for invoices
CREATE POLICY invoices_select ON invoices FOR SELECT USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY invoices_insert ON invoices FOR INSERT WITH CHECK (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY invoices_update ON invoices FOR UPDATE USING (company_id = current_setting('app.company_id')::uuid);
CREATE POLICY invoices_delete ON invoices FOR DELETE USING (company_id = current_setting('app.company_id')::uuid);
