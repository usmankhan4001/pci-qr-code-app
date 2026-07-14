import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui-icons";
import { CreatorForm } from "./creator-form";

export default async function NewQrPage() {
  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="ui-page-grid">
      <section className="ui-page-header p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="ui-page-eyebrow">Create QR</p>
            <h1 className="ui-title mt-2">Build a branded dynamic code</h1>
            <p className="ui-description mt-3 max-w-2xl">
              Every QR encodes a short PCI tracking link, so printed material can stay fixed while the destination changes later.
            </p>
          </div>
          <div className="ui-soft-panel flex items-center gap-3 px-4 py-3">
            <span className="ui-section-icon">
              <Icon name="shield" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">Dynamic by default</p>
              <p className="text-xs text-[var(--muted)]">Trackable short links for every export</p>
            </div>
          </div>
        </div>
      </section>
      <CreatorForm
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
