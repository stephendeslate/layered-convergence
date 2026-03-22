-- TRACED: EM-DB-002 — RLS enabled and forced on all tables
-- TRACED: EM-ARCH-002 — Multi-tenant RLS enforcement

-- Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'SELLER', 'BUYER');
CREATE TYPE listing_status AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED', 'SUSPENDED');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'DISPUTED', 'REFUNDED', 'FAILED');

-- Tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(email, tenant_id)
);

-- Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    status listing_status NOT NULL DEFAULT 'ACTIVE',
    seller_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(12, 2) NOT NULL,
    status transaction_status NOT NULL DEFAULT 'PENDING',
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    listing_id UUID NOT NULL REFERENCES listings(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Escrow Accounts
CREATE TABLE escrow_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount DECIMAL(12, 2) NOT NULL,
    transaction_id UUID NOT NULL UNIQUE REFERENCES transactions(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email_tenant ON users(email, tenant_id);
CREATE INDEX idx_listings_tenant ON listings(tenant_id);
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_escrow_transaction ON escrow_accounts(transaction_id);

-- Row-Level Security
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings FORCE ROW LEVEL SECURITY;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts FORCE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY tenant_isolation_tenants ON tenants
    USING (id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_users ON users
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_listings ON listings
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_transactions ON transactions
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

CREATE POLICY tenant_isolation_escrow ON escrow_accounts
    USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
