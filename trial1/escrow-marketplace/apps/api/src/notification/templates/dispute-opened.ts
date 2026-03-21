/**
 * Email template: Dispute opened (sent to both parties).
 */
export function disputeOpenedProviderTemplate(data: {
  providerName: string;
  buyerName: string;
  amount: number;
  disputeReason: string;
  disputeDescription: string;
  disputeCreatedAt: string;
}): { subject: string; html: string } {
  const amountDollars = (data.amount / 100).toFixed(2);

  return {
    subject: `Dispute filed: Transaction $${amountDollars}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #991b1b;">Dispute Filed</h2>
    <p style="margin: 0; color: #dc2626;">A dispute has been filed on your transaction.</p>
  </div>

  <p>Hello ${data.providerName},</p>

  <p>A dispute has been filed on the following transaction:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">$${amountDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Buyer:</td><td style="padding: 8px 0;">${data.buyerName}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Reason:</td><td style="padding: 8px 0;">${data.disputeReason}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.disputeDescription}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Filed at:</td><td style="padding: 8px 0;">${data.disputeCreatedAt}</td></tr>
  </table>

  <p>The auto-release timer has been paused. You may submit evidence to support your position.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}

export function disputeOpenedBuyerTemplate(data: {
  buyerName: string;
  amount: number;
  disputeReason: string;
  disputeDescription: string;
  disputeCreatedAt: string;
}): { subject: string; html: string } {
  const amountDollars = (data.amount / 100).toFixed(2);

  return {
    subject: `Dispute filed: Transaction $${amountDollars}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #854d0e;">Dispute Submitted</h2>
    <p style="margin: 0; color: #a16207;">Your dispute has been submitted and is under review.</p>
  </div>

  <p>Hello ${data.buyerName},</p>

  <p>Your dispute has been submitted:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">$${amountDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Reason:</td><td style="padding: 8px 0;">${data.disputeReason}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.disputeDescription}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Filed at:</td><td style="padding: 8px 0;">${data.disputeCreatedAt}</td></tr>
  </table>

  <p>An admin will review your dispute. You can submit additional evidence to support your case.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}
