-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dispute" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payout" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StripeAccount" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Webhook" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Transaction table
CREATE POLICY "transaction_buyer_access" ON "Transaction"
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "buyerId" = current_setting('app.current_user_id', true)
    OR "sellerId" = current_setting('app.current_user_id', true)
  );

-- Create RLS policies for Dispute table
CREATE POLICY "dispute_participant_access" ON "Dispute"
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "filedById" = current_setting('app.current_user_id', true)
  );

-- Create RLS policies for Payout table
CREATE POLICY "payout_user_access" ON "Payout"
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR "userId" = current_setting('app.current_user_id', true)
  );

-- Bypass RLS for the application service role
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Dispute" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Payout" FORCE ROW LEVEL SECURITY;
ALTER TABLE "StripeAccount" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Webhook" FORCE ROW LEVEL SECURITY;
