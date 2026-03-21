-- Field Service Dispatch: Initial Migration
-- Creates all tables with RLS enabled and forced

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "role" AS ENUM ('ADMIN', 'DISPATCHER', 'TECHNICIAN', 'CUSTOMER');
CREATE TYPE "work_order_status" AS ENUM ('CREATED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');
CREATE TYPE "priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "availability_status" AS ENUM ('AVAILABLE', 'BUSY', 'OFF_DUTY', 'ON_BREAK');

-- Tenants
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;

-- Users
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'CUSTOMER',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

-- Technician Profiles
CREATE TABLE "technician_profiles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "skills" TEXT[] NOT NULL,
    "availability" "availability_status" NOT NULL DEFAULT 'AVAILABLE',
    "latitude" DECIMAL(10, 7),
    "longitude" DECIMAL(10, 7),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "technician_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "technician_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);
CREATE UNIQUE INDEX "technician_profiles_user_id_key" ON "technician_profiles"("user_id");
ALTER TABLE "technician_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "technician_profiles" FORCE ROW LEVEL SECURITY;

-- Service Locations
CREATE TABLE "service_locations" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10, 7) NOT NULL,
    "longitude" DECIMAL(10, 7) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "service_locations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "service_locations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
);
ALTER TABLE "service_locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_locations" FORCE ROW LEVEL SECURITY;

-- Work Orders
CREATE TABLE "work_orders" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "technician_id" UUID,
    "location_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "work_order_status" NOT NULL DEFAULT 'CREATED',
    "priority" "priority" NOT NULL DEFAULT 'MEDIUM',
    "scheduled_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "work_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id"),
    CONSTRAINT "work_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id"),
    CONSTRAINT "work_orders_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technician_profiles"("id"),
    CONSTRAINT "work_orders_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "service_locations"("id")
);
ALTER TABLE "work_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_orders" FORCE ROW LEVEL SECURITY;

-- Work Order Notes
CREATE TABLE "work_order_notes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "work_order_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "work_order_notes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "work_order_notes_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id"),
    CONSTRAINT "work_order_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id")
);
ALTER TABLE "work_order_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_order_notes" FORCE ROW LEVEL SECURITY;

-- Work Order Transitions
CREATE TABLE "work_order_transitions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "work_order_id" UUID NOT NULL,
    "from_status" "work_order_status" NOT NULL,
    "to_status" "work_order_status" NOT NULL,
    "changed_by" UUID NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "work_order_transitions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "work_order_transitions_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id")
);
ALTER TABLE "work_order_transitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "work_order_transitions" FORCE ROW LEVEL SECURITY;

-- Audit Logs
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
