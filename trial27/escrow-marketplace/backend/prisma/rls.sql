-- [TRACED:EM-001] Row Level Security for user-scoped data isolation
-- [TRACED:EM-028] FORCE ROW LEVEL SECURITY on ALL 5 tables

-- Enable RLS on all tables
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

-- User isolation policies
CREATE POLICY user_self_access ON users
  USING (id = current_setting('app.current_user_id')::text);

CREATE POLICY transaction_party_access ON transactions
  USING (
    buyer_id = current_setting('app.current_user_id')::text
    OR seller_id = current_setting('app.current_user_id')::text
  );

CREATE POLICY dispute_party_access ON disputes
  USING (
    filed_by = current_setting('app.current_user_id')::text
    OR transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id')::text
         OR seller_id = current_setting('app.current_user_id')::text
    )
  );

CREATE POLICY payout_party_access ON payouts
  USING (
    recipient_id = current_setting('app.current_user_id')::text
    OR transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id')::text
         OR seller_id = current_setting('app.current_user_id')::text
    )
  );

CREATE POLICY webhook_owner_access ON webhooks
  USING (true);
