-- [TRACED:SEC-005] Row Level Security policies for multi-tenant isolation
-- This file is applied after migrations to enforce tenant-level data isolation.

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners
-- [TRACED:DA-001] FORCE ROW LEVEL SECURITY on all tables
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;
ALTER TABLE webhooks FORCE ROW LEVEL SECURITY;

-- Users can only see their own record
CREATE POLICY users_isolation ON users
  USING (id = current_setting('app.current_user_id', true));

-- Transactions visible to buyer or seller
CREATE POLICY transactions_isolation ON transactions
  USING (
    buyer_id = current_setting('app.current_user_id', true)
    OR seller_id = current_setting('app.current_user_id', true)
  );

-- Disputes visible to the filer or transaction participants
CREATE POLICY disputes_isolation ON disputes
  USING (
    filed_by_id = current_setting('app.current_user_id', true)
    OR transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id', true)
         OR seller_id = current_setting('app.current_user_id', true)
    )
  );

-- Payouts visible to the seller
CREATE POLICY payouts_isolation ON payouts
  USING (seller_id = current_setting('app.current_user_id', true));

-- Webhooks visible to the owning user
CREATE POLICY webhooks_isolation ON webhooks
  USING (user_id = current_setting('app.current_user_id', true));
