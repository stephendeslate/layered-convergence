-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'dispatcher', 'technician', 'viewer');
CREATE TYPE "work_order_status" AS ENUM ('open', 'in_progress', 'completed', 'cancelled', 'failed');
CREATE TYPE "work_order_priority" AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE "technician_status" AS ENUM ('available', 'busy', 'off_duty', 'inactive');

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
);

CREATE UNIQUE INDEX "users_email_tenant_id_key" ON "users"("email", "tenant_id");

CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "work_order_status" NOT NULL DEFAULT 'open',
    "priority" "work_order_priority" NOT NULL DEFAULT 'medium',
    "latitude" DECIMAL(10, 7),
    "longitude" DECIMAL(10, 7),
    "tenant_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "work_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id"),
    CONSTRAINT "work_orders_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
);

-- Performance indexes for common query patterns
CREATE INDEX "work_orders_tenant_id_status_idx" ON "work_orders"("tenant_id", "status");
CREATE INDEX "work_orders_tenant_id_created_at_idx" ON "work_orders"("tenant_id", "created_at" DESC);

CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "status" "technician_status" NOT NULL DEFAULT 'available',
    "latitude" DECIMAL(10, 7) NOT NULL,
    "longitude" DECIMAL(10, 7) NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "technicians_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
);

-- Performance index for technician lookup by tenant and status
CREATE INDEX "technicians_tenant_id_status_idx" ON "technicians"("tenant_id", "status");

CREATE TABLE "schedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "work_order_id" TEXT NOT NULL,
    "technician_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "schedules_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id"),
    CONSTRAINT "schedules_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id")
);

-- Performance index for schedule lookups
CREATE INDEX "schedules_work_order_id_idx" ON "schedules"("work_order_id");
CREATE INDEX "schedules_technician_id_idx" ON "schedules"("technician_id");

-- Row Level Security on all tables
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
