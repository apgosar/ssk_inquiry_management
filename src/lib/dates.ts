/** Today's date as YYYY-MM-DD in the browser's local timezone (toISOString would use UTC and be a day off early in the morning in India). */
export function localDateString(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
