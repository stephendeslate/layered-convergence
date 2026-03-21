/**
 * Email template: Payment hold confirmed (sent to buyer).
 */
export function paymentReceivedTemplate(data: {
  buyerName: string;
  amount: number;
  providerName: string;
  description: string;
  transactionId: string;
  createdAt: string;
}): { subject: string; html: string } {
  const amountDollars = (data.amount / 100).toFixed(2);

  return {
    subject: `Payment hold confirmed: $${amountDollars}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #166534;">Payment Hold Confirmed</h2>
    <p style="margin: 0; color: #15803d;">Your payment of $${amountDollars} is being held securely.</p>
  </div>

  <p>Hello ${data.buyerName},</p>

  <p>Your payment hold has been successfully created:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">$${amountDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Provider:</td><td style="padding: 8px 0;">${data.providerName}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.description}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Created:</td><td style="padding: 8px 0;">${data.createdAt}</td></tr>
  </table>

  <p>Funds will be held until delivery is confirmed or auto-released per the conditional release terms.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}
