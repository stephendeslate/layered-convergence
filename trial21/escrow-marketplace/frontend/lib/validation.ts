// [TRACED:UI-002] Client-side validation helpers for Server Action form data
export function validateRequiredString(
  formData: FormData,
  field: string,
): string | null {
  const value = formData.get(field);
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  return value.trim();
}

export function validateRequiredNumber(
  formData: FormData,
  field: string,
): number | null {
  const value = formData.get(field);
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return null;
  }
  return num;
}
