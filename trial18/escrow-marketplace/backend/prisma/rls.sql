-- Row Level Security policies for tenant isolation
-- Applied after Prisma migrations

-- Enable RLS on all tenant-scoped tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;
ALTER TABLE webhooks FORCE ROW LEVEL SECURITY;

-- Transaction policies: buyers and sellers can see their own transactions
CREATE POLICY transactions_buyer_policy ON transactions
  FOR ALL
  USING (buyer_id = current_setting('app.current_user_id', true));

CREATE POLICY transactions_seller_policy ON transactions
  FOR ALL
  USING (seller_id = current_setting('app.current_user_id', true));

-- Dispute policies: users can see disputes they created
CREATE POLICY disputes_user_policy ON disputes
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- Payout policies: recipients can see their payouts
CREATE POLICY payouts_recipient_policy ON payouts
  FOR ALL
  USING (recipient_id = current_setting('app.current_user_id', true));

-- Webhook policies: accessible via transaction ownership
CREATE POLICY webhooks_transaction_policy ON webhooks
  FOR ALL
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id', true)
         OR seller_id = current_setting('app.current_user_id', true)
    )
  );

-- Admin policy: admins can see everything
CREATE POLICY transactions_admin_policy ON transactions
  FOR ALL
  USING (current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY disputes_admin_policy ON disputes
  FOR ALL
  USING (current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY payouts_admin_policy ON payouts
  FOR ALL
  USING (current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY webhooks_admin_policy ON webhooks
  FOR ALL
  USING (current_setting('app.current_user_role', true) = 'ADMIN');
