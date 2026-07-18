export function chatDate(value) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}
