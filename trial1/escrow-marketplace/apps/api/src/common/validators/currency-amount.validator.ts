import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that a value is a valid currency amount in cents:
 * - Must be a positive integer
 * - No floating-point amounts allowed
 */
@ValidatorConstraint({ async: false })
export class IsCurrencyAmountConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'number') return false;
    if (!Number.isInteger(value)) return false;
    if (value <= 0) return false;
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Amount must be a positive integer (cents)';
  }
}

export function IsCurrencyAmount(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCurrencyAmountConstraint,
    });
  };
}

/**
 * Validates that a string looks like a Stripe ID (starts with expected prefix).
 */
@ValidatorConstraint({ async: false })
export class IsStripeIdConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') return false;
    if (value.length < 3) return false;
    // Stripe IDs follow pattern: prefix_alphanumeric
    return /^[a-z]{2,}_[A-Za-z0-9]+$/.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Value must be a valid Stripe ID format (e.g., pi_xxx, acct_xxx)';
  }
}

export function IsStripeId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStripeIdConstraint,
    });
  };
}
