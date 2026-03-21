/**
 * Email template: Welcome email on registration.
 */
export function welcomeTemplate(data: {
  displayName: string;
  role: string;
}): { subject: string; html: string } {
  const roleDescription =
    data.role === 'PROVIDER'
      ? 'As a provider, you can offer services and receive payments through our conditional payment system. Complete your Stripe onboarding to start accepting payments.'
      : 'As a buyer, you can create payment holds for services and release funds once delivery is confirmed.';

  return {
    subject: 'Welcome to the Conditional Payment Marketplace',
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <h2 style="margin: 0 0 8px; color: #1e40af;">Welcome!</h2>
    <p style="margin: 0; color: #1d4ed8;">Your account has been created successfully.</p>
  </div>

  <p>Hello ${data.displayName},</p>

  <p>Welcome to the Conditional Payment Marketplace! ${roleDescription}</p>

  <h3 style="color: #374151;">Getting Started</h3>
  <ul style="color: #4b5563; line-height: 1.8;">
    <li>Verify your email address</li>
    <li>Complete your profile</li>
    ${data.role === 'PROVIDER' ? '<li>Complete Stripe onboarding to receive payments</li>' : '<li>Browse available providers</li>'}
    <li>Create your first transaction</li>
  </ul>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9ca3af;">Conditional Payment Marketplace (Demo Application — No Real Funds)</p>
</body>
</html>`.trim(),
  };
}
