import { prisma } from "@/lib/prisma";

export type ScanSummary = {
  total: number;
  last7Days: number;
  lastScanAt: Date | null;
};

export type ScanDay = { date: string; count: number };
export type DeviceBreakdown = { deviceType: string; count: number };

export async function getScanSummary(qrCodeId: string): Promise<ScanSummary> {
  const [total, last7Days, lastScan] = await Promise.all([
    prisma.scan.count({ where: { qrCodeId } }),
    prisma.scan.count({
      where: { qrCodeId, scannedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.scan.findFirst({ where: { qrCodeId }, orderBy: { scannedAt: "desc" }, select: { scannedAt: true } }),
  ]);

  return { total, last7Days, lastScanAt: lastScan?.scannedAt ?? null };
}

export async function getScanTimeSeries(qrCodeId: string, days = 30): Promise<ScanDay[]> {
  const rows = await prisma.$queryRaw<{ day: Date; count: bigint }[]>`
    SELECT date_trunc('day', "scannedAt") AS day, count(*) AS count
    FROM "Scan"
    WHERE "qrCodeId" = ${qrCodeId} AND "scannedAt" >= now() - (${days} || ' days')::interval
    GROUP BY day
    ORDER BY day ASC
  `;

  const counts = new Map(rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]));

  const series: ScanDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    series.push({ date, count: counts.get(date) ?? 0 });
  }
  return series;
}

export async function getDeviceBreakdown(qrCodeId: string): Promise<DeviceBreakdown[]> {
  const rows = await prisma.$queryRaw<{ device_type: string | null; count: bigint }[]>`
    SELECT coalesce("deviceType", 'unknown') AS device_type, count(*) AS count
    FROM "Scan"
    WHERE "qrCodeId" = ${qrCodeId}
    GROUP BY device_type
    ORDER BY count DESC
  `;

  return rows.map((r) => ({ deviceType: r.device_type ?? "unknown", count: Number(r.count) }));
}
