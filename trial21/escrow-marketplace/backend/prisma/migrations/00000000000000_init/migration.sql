-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'FUNDED', 'SHIPPED', 'DELIVERED', 'RELEASED', 'DISPUTED', 'RESOLVED', 'REFUNDED');
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED');
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
CREATE TYPE "WebhookStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "WebhookStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "disputes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payouts" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "transactions" FORCE ROW LEVEL SECURITY;
ALTER TABLE "disputes" FORCE ROW LEVEL SECURITY;
ALTER TABLE "payouts" FORCE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "users_select_own" ON "users" FOR SELECT USING (id = current_setting('app.current_user_id', true));
CREATE POLICY "users_insert" ON "users" FOR INSERT WITH CHECK (true);

-- RLS Policies for transactions
CREATE POLICY "transactions_select_own" ON "transactions" FOR SELECT USING (
    buyer_id = current_setting('app.current_user_id', true) OR
    seller_id = current_setting('app.current_user_id', true)
);
CREATE POLICY "transactions_insert" ON "transactions" FOR INSERT WITH CHECK (
    buyer_id = current_setting('app.current_user_id', true)
);
CREATE POLICY "transactions_update_own" ON "transactions" FOR UPDATE USING (
    buyer_id = current_setting('app.current_user_id', true) OR
    seller_id = current_setting('app.current_user_id', true)
);

-- RLS Policies for disputes
CREATE POLICY "disputes_select_own" ON "disputes" FOR SELECT USING (
    transaction_id IN (
        SELECT id FROM "transactions"
        WHERE buyer_id = current_setting('app.current_user_id', true)
        OR seller_id = current_setting('app.current_user_id', true)
    )
);
CREATE POLICY "disputes_insert" ON "disputes" FOR INSERT WITH CHECK (
    transaction_id IN (
        SELECT id FROM "transactions"
        WHERE buyer_id = current_setting('app.current_user_id', true)
    )
);
CREATE POLICY "disputes_update" ON "disputes" FOR UPDATE USING (
    transaction_id IN (
        SELECT id FROM "transactions"
        WHERE buyer_id = current_setting('app.current_user_id', true)
        OR seller_id = current_setting('app.current_user_id', true)
    )
);

-- RLS Policies for payouts
CREATE POLICY "payouts_select_own" ON "payouts" FOR SELECT USING (
    recipient_id = current_setting('app.current_user_id', true)
);
CREATE POLICY "payouts_insert" ON "payouts" FOR INSERT WITH CHECK (
    recipient_id = current_setting('app.current_user_id', true)
);
