-- [TRACED:EM-029] FORCE ROW LEVEL SECURITY on ALL tables
-- [TRACED:SEC-001] Row Level Security for all Escrow Marketplace tables
-- FORCE ROW LEVEL SECURITY on ALL tables

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks FORCE ROW LEVEL SECURITY;

-- User can only see their own data
CREATE POLICY user_self_access ON users
  USING (id = current_setting('app.current_user_id')::uuid);

-- Transaction: buyer or seller can see
CREATE POLICY transaction_participant_access ON transactions
  USING (
    buyer_id = current_setting('app.current_user_id')::uuid OR
    seller_id = current_setting('app.current_user_id')::uuid
  );

-- Dispute: filer or transaction participant can see
CREATE POLICY dispute_access ON disputes
  USING (
    filed_by = current_setting('app.current_user_id')::uuid OR
    transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id')::uuid
         OR seller_id = current_setting('app.current_user_id')::uuid
    )
  );

-- Payout: transaction participant access
CREATE POLICY payout_access ON payouts
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id')::uuid
         OR seller_id = current_setting('app.current_user_id')::uuid
    )
  );
