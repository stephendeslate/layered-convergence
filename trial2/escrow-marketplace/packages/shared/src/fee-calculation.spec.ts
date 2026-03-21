import { describe, it, expect } from 'vitest';
import { calculateFee } from './fee-calculation';

describe('calculateFee', () => {
  it('should calculate 10% fee on 10000 cents', () => {
    const result = calculateFee(10000, 10, 50);
    expect(result.platformFeeAmount).toBe(1000);
    expect(result.providerAmount).toBe(9000);
    expect(result.platformFeePercent).toBe(10);
  });

  it('should apply minimum fee when calculated fee is less', () => {
    const result = calculateFee(200, 10, 50);
    expect(result.platformFeeAmount).toBe(50);
    expect(result.providerAmount).toBe(150);
  });

  it('should ceil fractional fees', () => {
    const result = calculateFee(1001, 10, 50);
    expect(result.platformFeeAmount).toBe(101);
    expect(result.providerAmount).toBe(900);
  });

  it('should cap fee at amount', () => {
    const result = calculateFee(30, 100, 50);
    expect(result.platformFeeAmount).toBe(30);
    expect(result.providerAmount).toBe(0);
  });

  it('should throw for zero amount', () => {
    expect(() => calculateFee(0)).toThrow('Amount must be positive');
  });

  it('should throw for negative amount', () => {
    expect(() => calculateFee(-100)).toThrow('Amount must be positive');
  });

  it('should throw for fee percent > 100', () => {
    expect(() => calculateFee(1000, 101)).toThrow('Fee percent must be between 0 and 100');
  });

  it('should throw for negative fee percent', () => {
    expect(() => calculateFee(1000, -1)).toThrow('Fee percent must be between 0 and 100');
  });

  it('should work with 0% fee (still applies minimum)', () => {
    const result = calculateFee(10000, 0, 50);
    expect(result.platformFeeAmount).toBe(50);
    expect(result.providerAmount).toBe(9950);
  });

  it('should use default fee percent of 10', () => {
    const result = calculateFee(10000);
    expect(result.platformFeeAmount).toBe(1000);
  });
});
