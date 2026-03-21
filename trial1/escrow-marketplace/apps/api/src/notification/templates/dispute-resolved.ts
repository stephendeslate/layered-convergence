/**
 * Email template: Dispute resolved (sent to both parties).
 */
export function disputeResolvedTemplate(data: {
  recipientName: string;
  amount: number;
  resolution: string;
  resolutionNote: string;
  resolvedAt: string;
  description: string;
}): { subject: string; html: string } {
  const amountDollars = (data.amount / 100).toFixed(2);

  const resolutionLabel =
    data.resolution === 'RESOLVED_RELEASED'
      ? 'Released to provider'
      : data.resolution === 'RESOLVED_REFUNDED'
        ? 'Refunded to buyer'
        : 'Escalated for further review';

  const bgColor =
    data.resolution === 'RESOLVED_RELEASED'
      ? '#f0fdf4'
      : data.resolution === 'RESOLVED_REFUNDED'
        ? '#eff6ff'
        : '#fefce8';
  const borderColor =
    data.resolution === 'RESOLVED_RELEASED'
      ? '#86efac'
      : data.resolution === 'RESOLVED_REFUNDED'
        ? '#93c5fd'
        : '#fde047';

  let outcomeText: string;
  if (data.resolution === 'RESOLVED_RELEASED') {
    outcomeText = 'Funds have been released to the provider.';
  } else if (data.resolution === 'RESOLVED_REFUNDED') {
    outcomeText = "Funds have been refunded to the buyer's payment method.";
  } else {
    outcomeText =
      'This dispute has been escalated for further review. We will contact you with additional information.';
  }

  return {
    subject: `Dispute resolved: ${resolutionLabel}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px;">Dispute Resolved</h2>
    <p style="margin: 0;">${resolutionLabel}</p>
  </div>

  <p>Hello ${data.recipientName},</p>

  <p>The dispute on the following transaction has been resolved:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; font-weight: 600;">$${amountDollars}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Description:</td><td style="padding: 8px 0;">${data.description}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Resolution:</td><td style="padding: 8px 0;">${resolutionLabel}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Admin note:</td><td style="padding: 8px 0;">${data.resolutionNote}</td></tr>
    <tr><td style="padding: 8px 0; color: #666;">Resolved at:</td><td style="padding: 8px 0;">${data.resolvedAt}</td></tr>
  </table>

  <p>${outcomeText}</p>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}
