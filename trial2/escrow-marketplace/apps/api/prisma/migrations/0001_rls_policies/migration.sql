-- Row Level Security Policies for tenant data isolation
-- These policies ensure users can only access their own data at the database level

-- Enable RLS on tenant-scoped tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_state_history ENABLE ROW LEVEL SECURITY;

-- Force RLS even for the table owner (the application DB user)
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;
ALTER TABLE transaction_state_history FORCE ROW LEVEL SECURITY;

-- Transaction policies
-- Buyers can see transactions where they are the buyer
-- Providers can see transactions where they are the provider
-- Admins can see all transactions
CREATE POLICY transactions_buyer_select ON transactions
  FOR SELECT
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "buyerId" = current_setting('app.current_user_id', true)::text
    OR "providerId" = current_setting('app.current_user_id', true)::text
  );

CREATE POLICY transactions_buyer_insert ON transactions
  FOR INSERT
  WITH CHECK (
    "buyerId" = current_setting('app.current_user_id', true)::text
  );

CREATE POLICY transactions_update ON transactions
  FOR UPDATE
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "buyerId" = current_setting('app.current_user_id', true)::text
    OR "providerId" = current_setting('app.current_user_id', true)::text
  );

-- Dispute policies
CREATE POLICY disputes_select ON disputes
  FOR SELECT
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "raisedById" = current_setting('app.current_user_id', true)::text
    OR EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = disputes."transactionId"
      AND (
        t."buyerId" = current_setting('app.current_user_id', true)::text
        OR t."providerId" = current_setting('app.current_user_id', true)::text
      )
    )
  );

CREATE POLICY disputes_insert ON disputes
  FOR INSERT
  WITH CHECK (
    "raisedById" = current_setting('app.current_user_id', true)::text
  );

CREATE POLICY disputes_update ON disputes
  FOR UPDATE
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "raisedById" = current_setting('app.current_user_id', true)::text
  );

-- Payout policies
CREATE POLICY payouts_select ON payouts
  FOR SELECT
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "providerId" = current_setting('app.current_user_id', true)::text
  );

CREATE POLICY payouts_insert ON payouts
  FOR INSERT
  WITH CHECK (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "providerId" = current_setting('app.current_user_id', true)::text
  );

CREATE POLICY payouts_update ON payouts
  FOR UPDATE
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
  );

-- Transaction state history policies
CREATE POLICY state_history_select ON transaction_state_history
  FOR SELECT
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_state_history."transactionId"
      AND (
        t."buyerId" = current_setting('app.current_user_id', true)::text
        OR t."providerId" = current_setting('app.current_user_id', true)::text
      )
    )
  );

CREATE POLICY state_history_insert ON transaction_state_history
  FOR INSERT
  WITH CHECK (true);
