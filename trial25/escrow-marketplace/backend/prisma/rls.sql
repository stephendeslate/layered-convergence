-- [TRACED:SEC-002] Row Level Security policies for user-scoped data isolation
-- RLS is applied to all tables using current_setting('app.user_id')

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- [TRACED:SEC-003] FORCE ROW LEVEL SECURITY on all tables
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;
ALTER TABLE webhooks FORCE ROW LEVEL SECURITY;

-- User isolation: users can only see their own record
CREATE POLICY user_isolation ON users
  USING (id = current_setting('app.user_id', true));

-- Transaction isolation: buyers and sellers can see their transactions
CREATE POLICY transaction_isolation ON transactions
  USING (
    buyer_id = current_setting('app.user_id', true)
    OR seller_id = current_setting('app.user_id', true)
  );

-- Dispute isolation: parties to the transaction can see disputes
CREATE POLICY dispute_isolation ON disputes
  USING (
    filed_by_id = current_setting('app.user_id', true)
    OR transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.user_id', true)
      OR seller_id = current_setting('app.user_id', true)
    )
  );

-- Payout isolation: recipient can see their payouts
CREATE POLICY payout_isolation ON payouts
  USING (recipient_id = current_setting('app.user_id', true));

-- Webhook isolation: owner can see their webhooks
CREATE POLICY webhook_isolation ON webhooks
  USING (owner_id = current_setting('app.user_id', true));
