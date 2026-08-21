export function sanitizePlainText(value: string, max = 12000): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\u202E|\u202D|\u2066|\u2067|\u2068|\u2069/g, "")
    .trim()
    .slice(0, max);
}
