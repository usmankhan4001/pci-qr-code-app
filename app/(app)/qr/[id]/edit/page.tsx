import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui-icons";
import { styleConfigSchema } from "@/lib/qr-style";
import { contentConfigToFieldState, type QrTypeValue } from "@/lib/qr-content";
import { EditForm } from "./edit-form";

export default async function EditQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) notFound();

  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const style = styleConfigSchema.parse(qr.styleConfig);
  const fields = contentConfigToFieldState(qr.type as QrTypeValue, qr.contentConfig);
  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";

  return (
    <div className="ui-page-grid">
      <section className="ui-page-header p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="ui-page-eyebrow">Edit QR</p>
            <h1 className="ui-title mt-2">{qr.label}</h1>
            <p className="ui-description mt-3 max-w-2xl">
              Tracking link {redirectBase}/q/{qr.shortcode} stays the same, so printed codes keep working.
            </p>
          </div>
          <div className="ui-soft-panel flex items-center gap-3 px-4 py-3">
            <span className="ui-section-icon">
              <Icon name="link" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Shortcode locked</p>
              <p className="font-mono text-xs text-[var(--muted)]">{qr.shortcode}</p>
            </div>
          </div>
        </div>
      </section>
      <EditForm
        qr={{
          id: qr.id,
          type: qr.type as QrTypeValue,
          label: qr.label,
          tags: qr.tags.join(", "),
          shortcode: qr.shortcode,
          brandTemplateId: qr.brandTemplateId,
          fields,
          style,
        }}
        templates={templates.map((t) => ({
          id: t.id,
          name: t.name,
          foreground: t.foreground,
          background: t.background,
          dotStyle: t.dotStyle,
          cornerStyle: t.cornerStyle,
          logoUrl: t.logoUrl,
          isDefault: t.isDefault,
        }))}
      />
    </div>
  );
}
