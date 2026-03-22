-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'buyer', 'seller');
CREATE TYPE "listing_status" AS ENUM ('active', 'sold', 'cancelled', 'suspended');
CREATE TYPE "transaction_status" AS ENUM ('pending', 'in_escrow', 'completed', 'cancelled', 'disputed');
CREATE TYPE "escrow_status" AS ENUM ('holding', 'released', 'refunded', 'disputed');
CREATE TYPE "dispute_status" AS ENUM ('open', 'reviewing', 'resolved', 'escalated', 'closed');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'buyer',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "status" "listing_status" NOT NULL DEFAULT 'active',
    "seller_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "transaction_status" NOT NULL DEFAULT 'pending',
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "escrows" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "status" "escrow_status" NOT NULL DEFAULT 'holding',
    "transaction_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "resolution" TEXT,
    "status" "dispute_status" NOT NULL DEFAULT 'open',
    "transaction_id" TEXT NOT NULL,
    "filer_id" TEXT NOT NULL,
    "respondent_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "escrows_transaction_id_key" ON "escrows"("transaction_id");

CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "listings_tenant_id_idx" ON "listings"("tenant_id");
CREATE INDEX "listings_status_idx" ON "listings"("status");
CREATE INDEX "listings_seller_id_status_idx" ON "listings"("seller_id", "status");
CREATE INDEX "transactions_tenant_id_idx" ON "transactions"("tenant_id");
CREATE INDEX "transactions_status_idx" ON "transactions"("status");
CREATE INDEX "transactions_buyer_id_status_idx" ON "transactions"("buyer_id", "status");
CREATE INDEX "transactions_seller_id_status_idx" ON "transactions"("seller_id", "status");
CREATE INDEX "escrows_tenant_id_idx" ON "escrows"("tenant_id");
CREATE INDEX "escrows_status_idx" ON "escrows"("status");
CREATE INDEX "disputes_tenant_id_idx" ON "disputes"("tenant_id");
CREATE INDEX "disputes_status_idx" ON "disputes"("status");
CREATE INDEX "disputes_transaction_id_idx" ON "disputes"("transaction_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "escrows" ADD CONSTRAINT "escrows_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_filer_id_fkey" FOREIGN KEY ("filer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security on all tables
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" FORCE ROW LEVEL SECURITY;
ALTER TABLE "escrows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "escrows" FORCE ROW LEVEL SECURITY;
ALTER TABLE "disputes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "disputes" FORCE ROW LEVEL SECURITY;
