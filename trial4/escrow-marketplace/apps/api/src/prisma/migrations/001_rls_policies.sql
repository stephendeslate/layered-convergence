-- Escrow Marketplace — Row Level Security Policies
-- User-based isolation: dual-party access (buyer OR provider)
-- Follows v4.0 Section 5.14 Isolation Pattern Variants (dual-party pattern)

-- Enable RLS on user-scoped tables
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TransactionStateHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dispute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payout" ENABLE ROW LEVEL SECURITY;

-- Transaction: dual-party isolation (buyer OR provider can access)
CREATE POLICY "user_isolation_transaction" ON "Transaction"
  USING (
    "buyerId" = current_setting('app.current_user_id', true)
    OR "providerId" = current_setting('app.current_user_id', true)
  );

-- TransactionStateHistory: scoped via transaction -> buyer/provider
CREATE POLICY "user_isolation_tx_history" ON "TransactionStateHistory"
  USING ("transactionId" IN (
    SELECT id FROM "Transaction"
    WHERE "buyerId" = current_setting('app.current_user_id', true)
       OR "providerId" = current_setting('app.current_user_id', true)
  ));

-- Dispute: scoped via transaction -> buyer/provider
CREATE POLICY "user_isolation_dispute" ON "Dispute"
  USING ("transactionId" IN (
    SELECT id FROM "Transaction"
    WHERE "buyerId" = current_setting('app.current_user_id', true)
       OR "providerId" = current_setting('app.current_user_id', true)
  ));

-- Payout: provider-only access
CREATE POLICY "user_isolation_payout" ON "Payout"
  USING ("providerId" = current_setting('app.current_user_id', true));

-- Admin bypass policy (role-based pattern from v4.0 Section 5.14)
CREATE POLICY "admin_bypass_transaction" ON "Transaction"
  USING (current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY "admin_bypass_dispute" ON "Dispute"
  USING (current_setting('app.current_user_role', true) = 'ADMIN');

CREATE POLICY "admin_bypass_payout" ON "Payout"
  USING (current_setting('app.current_user_role', true) = 'ADMIN');
