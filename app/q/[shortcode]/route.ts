import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logScan } from "@/lib/scan";
import { type QrTypeValue } from "@/lib/qr-content";
import { renderWifiLanding, renderTextLanding } from "@/lib/qr-landing";

export async function GET(request: Request, ctx: RouteContext<"/q/[shortcode]">) {
  const { shortcode } = await ctx.params;

  const qr = await prisma.qrCode.findUnique({ where: { shortcode } });

  if (!qr || qr.status === "ARCHIVED") {
    return new NextResponse(
      "<!doctype html><meta charset=utf-8><title>Not available</title>" +
        "<p style=\"font:16px system-ui;padding:2rem;text-align:center\">This QR code is no longer active.</p>",
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
    );
  }

  logScan(qr.id, request);

  const type = qr.type as QrTypeValue;

  // URL/EMAIL/PHONE encode a redirect target (https:, mailto:, tel:); the
  // rest (vCard/WiFi/text) are served directly since there's nothing to
  // "open" them with. Note: a WIFI QR routed through this tracking redirect
  // opens a browser instead of the OS's native "join this network" prompt
  // (that only fires when a camera scans a raw WIFI: string) — the
  // trade-off accepted for making every QR type dynamic and trackable.
  if (type === "URL" || type === "EMAIL" || type === "PHONE") {
    return NextResponse.redirect(qr.destinationUrl, {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (type === "VCARD") {
    return new NextResponse(qr.destinationUrl, {
      status: 200,
      headers: {
        "Content-Type": "text/vcard; charset=utf-8",
        "Content-Disposition": `attachment; filename="${qr.label.replace(/[^\w.-]+/g, "_")}.vcf"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const body = type === "WIFI" ? renderWifiLanding(qr.contentConfig) : renderTextLanding(qr.destinationUrl);
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
