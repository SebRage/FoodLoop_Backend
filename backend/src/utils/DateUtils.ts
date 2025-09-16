let DateTime: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  DateTime = require('luxon').DateTime;
} catch (e) {
  DateTime = null;
}

export function formatToBogotaShort(date: Date | string | undefined | null): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  if (DateTime) {
    // formato: 2025-09-08 3:18:00pm (h without leading zero, lowercase am/pm, no space)
    return DateTime.fromJSDate(d)
      .setZone('America/Bogota')
      .toFormat("yyyy-MM-dd h:mm:ssa")
      .toLowerCase();
  }

  // Fallback manual: calcular hora en Bogotá (UTC-5)
  const bogotaMs = d.getTime() + (-5 * 60 * 60 * 1000);
  const bogota = new Date(bogotaMs);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = bogota.getUTCFullYear();
  const month = pad(bogota.getUTCMonth() + 1);
  const day = pad(bogota.getUTCDate());
  let hour = bogota.getUTCHours();
  const minute = pad(bogota.getUTCMinutes());
  const second = pad(bogota.getUTCSeconds());
  const ampm = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  // hour without leading zero as in example
  return `${year}-${month}-${day} ${hour}:${minute}:${second}${ampm}`;
}
