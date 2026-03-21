export interface FeeCalculationResult {
  platformFeeAmount: number;
  platformFeePercent: number;
  providerAmount: number;
}

export function calculateFee(
  amountCents: number,
  feePercent: number = 10,
  minFeeCents: number = 50,
): FeeCalculationResult {
  if (amountCents <= 0) {
    throw new Error('Amount must be positive');
  }
  if (feePercent < 0 || feePercent > 100) {
    throw new Error('Fee percent must be between 0 and 100');
  }

  const calculatedFee = Math.ceil((amountCents * feePercent) / 100);
  const platformFeeAmount = Math.max(calculatedFee, minFeeCents);
  const cappedFee = Math.min(platformFeeAmount, amountCents);

  return {
    platformFeeAmount: cappedFee,
    platformFeePercent: feePercent,
    providerAmount: amountCents - cappedFee,
  };
}
