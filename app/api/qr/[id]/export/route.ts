import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { styleConfigSchema } from "@/lib/qr-style";
import { renderQrSvg, renderQrPng, renderQrPdf } from "@/lib/qr-render";

const ALLOWED_SIZES = [512, 1024, 2048] as const;
const ALLOWED_FORMATS = ["svg", "png", "pdf"] as const;

export async function GET(request: Request, ctx: RouteContext<"/api/qr/[id]/export">) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const { searchParams } = new URL(request.url);

  const format = searchParams.get("format") ?? "png";
  const size = Number(searchParams.get("size") ?? "1024");

  if (!ALLOWED_FORMATS.includes(format as (typeof ALLOWED_FORMATS)[number])) {
    return NextResponse.json({ error: "format must be svg, png, or pdf" }, { status: 400 });
  }
  if (format !== "svg" && !ALLOWED_SIZES.includes(size as (typeof ALLOWED_SIZES)[number])) {
    return NextResponse.json({ error: "size must be 512, 1024, or 2048" }, { status: 400 });
  }

  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const style = styleConfigSchema.parse(qr.styleConfig);
  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";
  const trackingUrl = `${redirectBase}/q/${qr.slug}`;
  const filenameBase = qr.label.replace(/[^\w.-]+/g, "_");

  if (format === "svg") {
    const svg = await renderQrSvg(trackingUrl, style, 1024);
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${filenameBase}.svg"`,
      },
    });
  }

  if (format === "png") {
    const png = await renderQrPng(trackingUrl, style, size);
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filenameBase}-${size}.png"`,
      },
    });
  }

  const pdf = await renderQrPdf(trackingUrl, style, qr.label);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
    },
  });
}
