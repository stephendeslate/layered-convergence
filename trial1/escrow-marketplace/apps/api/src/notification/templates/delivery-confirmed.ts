/**
 * Email template: Delivery confirmed (sent to both parties).
 */
export function deliveryConfirmedBuyerTemplate(data: {
  buyerName: string;
  providerName: string;
  amount: number;
  description: string;
  deliveredAt: string;
  autoReleaseAt: string;
}): { subject: string; html: string } {
  const amountDollars = (data.amount / 100).toFixed(2);

  return {
    subject: `Delivery notification: ${data.description}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #1e40af;">Delivery Marked</h2>
    <p style="margin: 0; color: #1d4ed8;">${data.providerName} has marked the transaction as delivered.</p>
  </div>

  <p>Hello ${data.buyerName},</p>

  <p>${data.providerName} has marked the following transaction as delivered:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">$${amountDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.description}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Delivered:</td><td style="padding: 8px 0;">${data.deliveredAt}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Auto-release:</td><td style="padding: 8px 0;">${data.autoReleaseAt}</td></tr>
  </table>

  <p>Please review the delivery and confirm if satisfactory. If you do not take action within 72 hours, funds will be automatically released to the provider.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}

export function deliveryConfirmedProviderTemplate(data: {
  providerName: string;
  buyerName: string;
  amount: number;
  description: string;
  deliveredAt: string;
}): { subject: string; html: string } {
  const amountDollars = (data.amount / 100).toFixed(2);

  return {
    subject: `Delivery confirmed: ${data.description}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #1e40af;">Delivery Recorded</h2>
    <p style="margin: 0; color: #1d4ed8;">Your delivery has been recorded successfully.</p>
  </div>

  <p>Hello ${data.providerName},</p>

  <p>Your delivery has been recorded for:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">$${amountDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Buyer:</td><td style="padding: 8px 0;">${data.buyerName}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.description}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Delivered:</td><td style="padding: 8px 0;">${data.deliveredAt}</td></tr>
  </table>

  <p>The buyer has been notified. Funds will be released once the buyer confirms delivery or after the auto-release period.</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}
