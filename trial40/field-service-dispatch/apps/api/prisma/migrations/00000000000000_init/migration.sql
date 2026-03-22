-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'dispatcher', 'technician', 'viewer');
CREATE TYPE "work_order_status" AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'failed');
CREATE TYPE "work_order_priority" AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE "technician_status" AS ENUM ('available', 'busy', 'off_duty', 'inactive');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "work_order_status" NOT NULL DEFAULT 'open',
    "priority" "work_order_priority" NOT NULL DEFAULT 'medium',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "tenant_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "status" "technician_status" NOT NULL DEFAULT 'available',
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "work_order_id" TEXT NOT NULL,
    "technician_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "users_email_tenant_id_key" ON "users"("email", "tenant_id");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "work_orders_tenant_id_idx" ON "work_orders"("tenant_id");
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");
CREATE INDEX "work_orders_tenant_id_status_idx" ON "work_orders"("tenant_id", "status");
CREATE INDEX "work_orders_priority_idx" ON "work_orders"("priority");
CREATE INDEX "technicians_tenant_id_idx" ON "technicians"("tenant_id");
CREATE INDEX "technicians_status_idx" ON "technicians"("status");
CREATE INDEX "technicians_tenant_id_status_idx" ON "technicians"("tenant_id", "status");
CREATE INDEX "schedules_work_order_id_idx" ON "schedules"("work_order_id");
CREATE INDEX "schedules_technician_id_idx" ON "schedules"("technician_id");
CREATE INDEX "schedules_work_order_id_technician_id_idx" ON "schedules"("work_order_id", "technician_id");
CREATE INDEX "service_areas_tenant_id_idx" ON "service_areas"("tenant_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "service_areas" ADD CONSTRAINT "service_areas_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" FORCE ROW LEVEL SECURITY;
ALTER TABLE "technicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technicians" FORCE ROW LEVEL SECURITY;
ALTER TABLE "schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "schedules" FORCE ROW LEVEL SECURITY;
ALTER TABLE "service_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_areas" FORCE ROW LEVEL SECURITY;
