-- Field Service Dispatch — Row Level Security Policies
-- Company-based tenant isolation (v4.0 Section 5.14 company-based pattern)

-- Enable RLS on all company-scoped tables
ALTER TABLE "Technician" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkOrderStatusHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Route" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

-- Technician: scoped to companyId
CREATE POLICY "tenant_isolation_technician" ON "Technician"
  USING ("companyId" = current_setting('app.current_company_id', true));

-- Customer: scoped to companyId
CREATE POLICY "tenant_isolation_customer" ON "Customer"
  USING ("companyId" = current_setting('app.current_company_id', true));

-- WorkOrder: scoped to companyId
CREATE POLICY "tenant_isolation_workorder" ON "WorkOrder"
  USING ("companyId" = current_setting('app.current_company_id', true));

-- WorkOrderStatusHistory: scoped via work order -> company
CREATE POLICY "tenant_isolation_wo_history" ON "WorkOrderStatusHistory"
  USING ("workOrderId" IN (
    SELECT id FROM "WorkOrder" WHERE "companyId" = current_setting('app.current_company_id', true)
  ));

-- Route: scoped via technician -> company
CREATE POLICY "tenant_isolation_route" ON "Route"
  USING ("technicianId" IN (
    SELECT id FROM "Technician" WHERE "companyId" = current_setting('app.current_company_id', true)
  ));

-- JobPhoto: scoped via work order -> company
CREATE POLICY "tenant_isolation_jobphoto" ON "JobPhoto"
  USING ("workOrderId" IN (
    SELECT id FROM "WorkOrder" WHERE "companyId" = current_setting('app.current_company_id', true)
  ));

-- Invoice: scoped via work order -> company
CREATE POLICY "tenant_isolation_invoice" ON "Invoice"
  USING ("workOrderId" IN (
    SELECT id FROM "WorkOrder" WHERE "companyId" = current_setting('app.current_company_id', true)
  ));
