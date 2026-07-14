import { UAParser } from "ua-parser-js";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";

export function logScan(qrCodeId: string, request: Request): void {
  const headers = request.headers;
  const userAgent = headers.get("user-agent") ?? undefined;
  const referrer = headers.get("referer") ?? undefined;
  // Cloudflare Tunnel/CDN inject these on the origin request when traffic
  // flows through Cloudflare; no external geo-IP lookup needed.
  const ipCountry = headers.get("cf-ipcountry") ?? undefined;
  const ipCity = headers.get("cf-ipcity") ?? undefined;

  const deviceType = userAgent ? new UAParser(userAgent).getDevice().type ?? "desktop" : "desktop";

  after(async () => {
    await prisma.scan.create({
      data: {
        qrCodeId,
        userAgent,
        deviceType,
        referrer,
        ipCountry,
        ipCity,
      },
    });
  });
}
