/**
 * Email template: Funds released (sent to provider).
 */
export function fundsReleasedTemplate(data: {
  providerName: string;
  buyerName: string;
  amount: number;
  platformFee: number;
  providerAmount: number;
  description: string;
  releasedAt: string;
}): { subject: string; html: string } {
  const amountDollars = (data.amount / 100).toFixed(2);
  const feeDollars = (data.platformFee / 100).toFixed(2);
  const payoutDollars = (data.providerAmount / 100).toFixed(2);

  return {
    subject: `Funds released: $${amountDollars}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #166534;">Funds Released</h2>
    <p style="margin: 0; color: #15803d;">$${payoutDollars} has been released to your account.</p>
  </div>

  <p>Hello ${data.providerName},</p>

  <p>Funds have been released for your transaction:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #666;">Total amount:</td><td style="padding: 8px 0;">$${amountDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Platform fee:</td><td style="padding: 8px 0;">$${feeDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Your payout:</td><td style="padding: 8px 0; font-weight: 600;">$${payoutDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Buyer:</td><td style="padding: 8px 0;">${data.buyerName}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.description}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Released:</td><td style="padding: 8px 0;">${data.releasedAt}</td></tr>
  </table>

  <p>Your payout will be processed according to Stripe's payout schedule.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}
