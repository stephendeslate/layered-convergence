export function validateRequiredString(formData: FormData, field: string): string {
  const value = formData.get(field);
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  return value.trim();
}

export function validateOptionalString(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function validateRequiredNumber(formData: FormData, field: string): number {
  const value = formData.get(field);
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`);
  }
  const num = Number(value.trim());
  if (isNaN(num)) {
    throw new Error(`${field} must be a valid number`);
  }
  return num;
}
