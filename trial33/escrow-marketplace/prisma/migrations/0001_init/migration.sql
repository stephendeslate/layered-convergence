-- Escrow Marketplace: Initial Migration
-- Creates all tables with RLS enabled and forced

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE "role" AS ENUM ('ADMIN', 'BUYER', 'SELLER', 'ARBITER');
CREATE TYPE "escrow_status" AS ENUM ('CREATED', 'FUNDED', 'DELIVERED', 'RELEASED', 'DISPUTED', 'REFUNDED', 'CANCELLED');
CREATE TYPE "dispute_status" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'ESCALATED', 'CLOSED');

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
    "role" "role" NOT NULL DEFAULT 'BUYER',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

-- Escrow Transactions
CREATE TABLE "escrow_transactions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tenant_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "escrow_status" NOT NULL DEFAULT 'CREATED',
    "description" TEXT,
    "funded_at" TIMESTAMPTZ,
    "released_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "escrow_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id"),
    CONSTRAINT "escrow_transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id"),
    CONSTRAINT "escrow_transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id")
);
ALTER TABLE "escrow_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "escrow_transactions" FORCE ROW LEVEL SECURITY;

-- Disputes
CREATE TABLE "disputes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "transaction_id" UUID NOT NULL,
    "filed_by_id" UUID NOT NULL,
    "assigned_to_id" UUID,
    "status" "dispute_status" NOT NULL DEFAULT 'OPEN',
    "reason" TEXT NOT NULL,
    "resolution" TEXT,
    "filed_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "disputes_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "escrow_transactions"("id"),
    CONSTRAINT "disputes_filed_by_id_fkey" FOREIGN KEY ("filed_by_id") REFERENCES "users"("id"),
    CONSTRAINT "disputes_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id")
);
ALTER TABLE "disputes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "disputes" FORCE ROW LEVEL SECURITY;

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
