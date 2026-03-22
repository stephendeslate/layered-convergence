-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'manager', 'seller', 'buyer');
CREATE TYPE "listing_status" AS ENUM ('active', 'sold', 'cancelled', 'suspended');
CREATE TYPE "transaction_status" AS ENUM ('pending', 'completed', 'disputed', 'refunded', 'failed');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" "user_role" NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "status" "listing_status" NOT NULL DEFAULT 'active',
    "seller_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "escrow_accounts" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escrow_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "reason" VARCHAR(1000) NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_tenant_id_key" ON "users"("email", "tenant_id");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "listings_tenant_id_status_idx" ON "listings"("tenant_id", "status");
CREATE INDEX "listings_seller_id_idx" ON "listings"("seller_id");
CREATE INDEX "transactions_tenant_id_buyer_id_idx" ON "transactions"("tenant_id", "buyer_id");
CREATE INDEX "transactions_tenant_id_seller_id_idx" ON "transactions"("tenant_id", "seller_id");
CREATE INDEX "transactions_tenant_id_status_idx" ON "transactions"("tenant_id", "status");
CREATE UNIQUE INDEX "escrow_accounts_transaction_id_key" ON "escrow_accounts"("transaction_id");
CREATE INDEX "escrow_accounts_tenant_id_idx" ON "escrow_accounts"("tenant_id");
CREATE INDEX "disputes_transaction_id_idx" ON "disputes"("transaction_id");
CREATE INDEX "disputes_tenant_id_idx" ON "disputes"("tenant_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" FORCE ROW LEVEL SECURITY;
ALTER TABLE "escrow_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "escrow_accounts" FORCE ROW LEVEL SECURITY;
ALTER TABLE "disputes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "disputes" FORCE ROW LEVEL SECURITY;
