-- Row Level Security policies for multi-tenant isolation
-- Applied after Prisma migrations

-- Enable RLS on all user-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;

-- Users: can only see own profile (ADMIN sees all)
CREATE POLICY users_isolation ON users
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR id = current_setting('app.current_user_id', true)
  );

-- Transactions: buyer or seller can see their own (ADMIN sees all)
CREATE POLICY transactions_isolation ON transactions
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR buyer_id = current_setting('app.current_user_id', true)
    OR seller_id = current_setting('app.current_user_id', true)
  );

-- Disputes: buyer or seller on the dispute (ADMIN sees all)
CREATE POLICY disputes_isolation ON disputes
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR buyer_id = current_setting('app.current_user_id', true)
    OR seller_id = current_setting('app.current_user_id', true)
  );

-- Payouts: recipient can see their payouts (ADMIN sees all)
CREATE POLICY payouts_isolation ON payouts
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR recipient_id = current_setting('app.current_user_id', true)
  );
