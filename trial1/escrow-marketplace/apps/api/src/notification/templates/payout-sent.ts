/**
 * Email template: Payout sent to bank (sent to provider).
 */
export function payoutSentTemplate(data: {
  providerName: string;
  amount: number;
  description: string;
  paidAt: string;
}): { subject: string; html: string } {
  const amountDollars = (data.amount / 100).toFixed(2);

  return {
    subject: `Payout received: $${amountDollars}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #166534;">Payout Deposited</h2>
    <p style="margin: 0; color: #15803d;">$${amountDollars} has been deposited to your bank account.</p>
  </div>

  <p>Hello ${data.providerName},</p>

  <p>Your payout has been deposited to your bank account:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">$${amountDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Transaction:</td><td style="padding: 8px 0;">${data.description}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Paid at:</td><td style="padding: 8px 0;">${data.paidAt}</td></tr>
  </table>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}
