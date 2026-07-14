import path from "node:path";
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import QRCodeStyling from "qr-code-styling";
import sharp from "sharp";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { StyleConfig } from "@/lib/qr-style";
import { effectiveErrorCorrectionLevel } from "@/lib/qr-style";

const LOGO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

/**
 * qr-code-styling's jsdom image loading would need network access back to
 * our own server to resolve "/uploads/logos/…"; reading the file straight
 * off disk and inlining it as a data URI sidesteps that entirely.
 */
async function resolveLogoDataUri(logoUrl: string | null | undefined): Promise<string | undefined> {
  if (!logoUrl) return undefined;
  const ext = path.extname(logoUrl).toLowerCase();
  const mime = LOGO_MIME[ext];
  if (!mime) return undefined;

  const filePath = path.join(process.cwd(), "public", logoUrl);
  const buffer = await readFile(filePath);
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function renderQrSvgBuffer(data: string, style: StyleConfig, size: number): Promise<Buffer> {
  const logo = await resolveLogoDataUri(style.logoUrl);
  const hasLogo = Boolean(logo);

  const qr = new QRCodeStyling({
    jsdom: JSDOM,
    width: size,
    height: size,
    type: "svg",
    data,
    margin: style.margin,
    qrOptions: { errorCorrectionLevel: effectiveErrorCorrectionLevel(hasLogo) },
    image: logo,
    imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 6 },
    dotsOptions: { type: style.dotStyle, color: style.foreground },
    cornersSquareOptions: { type: style.cornerStyle, color: style.foreground },
    backgroundOptions: { color: style.background },
  });

  const raw = await qr.getRawData("svg");
  if (!raw) throw new Error("Failed to render QR code");
  return Buffer.isBuffer(raw) ? raw : Buffer.from(await (raw as Blob).arrayBuffer());
}

export async function renderQrSvg(data: string, style: StyleConfig, size: number): Promise<string> {
  const buffer = await renderQrSvgBuffer(data, style, size);
  return buffer.toString("utf-8");
}

export async function renderQrPng(data: string, style: StyleConfig, size: number): Promise<Buffer> {
  const svg = await renderQrSvgBuffer(data, style, size);
  return sharp(svg).png().toBuffer();
}

export async function renderQrPdf(data: string, style: StyleConfig, label: string): Promise<Buffer> {
  const pngSize = 1600;
  const png = await renderQrPng(data, style, pngSize);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([360, 460]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const image = await pdf.embedPng(png);
  const qrDrawSize = 300;
  page.drawImage(image, {
    x: (page.getWidth() - qrDrawSize) / 2,
    y: page.getHeight() - qrDrawSize - 60,
    width: qrDrawSize,
    height: qrDrawSize,
  });

  page.drawText(label, {
    x: 24,
    y: 40,
    size: 14,
    font,
    color: rgb(0.1, 0.1, 0.1),
    maxWidth: page.getWidth() - 48,
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
