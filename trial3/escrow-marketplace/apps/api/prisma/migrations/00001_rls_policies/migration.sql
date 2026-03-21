-- RLS Policies for Escrow Marketplace [VERIFY:RLS]
-- Defense-in-depth: Prisma connects as DB owner, bypasses RLS.
-- Primary isolation is application-level WHERE userId/role clauses.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_state_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation ON users
  USING (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY transaction_buyer_isolation ON transactions
  USING (buyer_id = current_setting('app.current_user_id', true)::uuid
    OR provider_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY state_history_isolation ON transaction_state_history
  USING (transaction_id IN (
    SELECT id FROM transactions
    WHERE buyer_id = current_setting('app.current_user_id', true)::uuid
      OR provider_id = current_setting('app.current_user_id', true)::uuid
  ));

CREATE POLICY dispute_isolation ON disputes
  USING (transaction_id IN (
    SELECT id FROM transactions
    WHERE buyer_id = current_setting('app.current_user_id', true)::uuid
      OR provider_id = current_setting('app.current_user_id', true)::uuid
  ));

CREATE POLICY connected_account_isolation ON stripe_connected_accounts
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY payout_isolation ON payouts
  USING (provider_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY webhook_admin_only ON webhook_logs
  USING (current_setting('app.current_role', true) = 'ADMIN');
