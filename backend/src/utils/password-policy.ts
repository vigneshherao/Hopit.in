export const passwordMessage =
  'Password must include uppercase, lowercase, number, and special character.';

export function isStrongPassword(value: string): boolean {
  return /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}
