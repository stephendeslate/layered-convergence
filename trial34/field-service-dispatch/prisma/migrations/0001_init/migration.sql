-- CreateEnum
CREATE TYPE "role" AS ENUM ('OWNER', 'ADMIN', 'DISPATCHER', 'TECHNICIAN');
CREATE TYPE "work_order_status" AS ENUM ('CREATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ESCALATED', 'ON_HOLD');
CREATE TYPE "priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "availability_status" AS ENUM ('AVAILABLE', 'ON_JOB', 'OFF_DUTY', 'ON_LEAVE');

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
    "name" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'TECHNICIAN',
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "work_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priority" "priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "work_order_status" NOT NULL DEFAULT 'CREATED',
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
    "assigned_to_id" UUID REFERENCES "technicians"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_order_transitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "work_order_id" UUID NOT NULL REFERENCES "work_orders"("id"),
    "from_status" TEXT NOT NULL,
    "to_status" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "work_order_transitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "technicians" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "availability" "availability_status" NOT NULL DEFAULT 'AVAILABLE',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_areas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "radius" DECIMAL(10,2) NOT NULL,
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "service_areas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL REFERENCES "tenants"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- TRACED: FD-DA-RLS-002 — RLS ENABLE + FORCE on all tables
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" FORCE ROW LEVEL SECURITY;
ALTER TABLE "work_order_transitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_order_transitions" FORCE ROW LEVEL SECURITY;
ALTER TABLE "technicians" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technicians" FORCE ROW LEVEL SECURITY;
ALTER TABLE "service_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_areas" FORCE ROW LEVEL SECURITY;
ALTER TABLE "equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "equipment" FORCE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
