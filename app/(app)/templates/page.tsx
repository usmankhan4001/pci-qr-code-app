import { prisma } from "@/lib/prisma";
import { deleteBrandTemplate } from "./actions";
import { TemplateForm } from "./template-form";
import { QrPreview } from "@/components/qr-preview";
import { Icon } from "@/components/ui-icons";

export default async function TemplatesPage() {
  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="ui-page-grid">
      <section className="ui-page-header p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="ui-page-eyebrow">Brand system</p>
            <h1 className="ui-title mt-2">Brand templates</h1>
            <p className="ui-description mt-3 max-w-2xl">
              Presets for PCI colors, dot styles, and logo placement so staff do not have to rebuild brand values by hand.
            </p>
          </div>
          <div className="ui-soft-panel flex items-center gap-3 px-4 py-3">
            <span className="ui-section-icon">
              <Icon name="palette" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">{templates.length} templates</p>
              <p className="text-xs text-[var(--muted)]">Reusable QR appearance presets</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {templates.map((template) => (
            <article key={template.id} className="ui-card ui-card-interactive overflow-hidden p-4">
              <div className="flex items-start gap-4">
                <div className="ui-preview-pad flex h-24 w-24 shrink-0 items-center justify-center p-2">
                  <QrPreview
                    size={72}
                    data="https://pcirealestate.com"
                    style={{
                      foreground: template.foreground,
                      background: template.background,
                      dotStyle: (template.dotStyle as never) ?? "square",
                      cornerStyle: (template.cornerStyle as never) ?? "square",
                      logoUrl: template.logoUrl,
                      margin: 8,
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-bold tracking-[-0.02em] text-[var(--foreground)]">
                      {template.name}
                    </p>
                    {template.isDefault ? <span className="ui-badge ui-badge-gold">Default</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {template.dotStyle}/{template.cornerStyle}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full border border-[var(--border)]" style={{ backgroundColor: template.foreground }} />
                    <span className="h-6 w-6 rounded-full border border-[var(--border)]" style={{ backgroundColor: template.background }} />
                    {template.logoUrl ? (
                      <span className="ui-badge ui-badge-muted">
                        <Icon name="image" className="h-3.5 w-3.5" />
                        Logo
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                <p className="font-mono text-xs text-[var(--muted)]">
                  {template.foreground} / {template.background}
                </p>
                <form action={deleteBrandTemplate.bind(null, template.id)}>
                  <button type="submit" className="ui-icon-button text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]" aria-label={`Delete ${template.name}`}>
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </article>
          ))}
          {templates.length === 0 ? (
            <div className="ui-empty lg:col-span-2 xl:col-span-1 2xl:col-span-2">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon name="palette" className="h-5 w-5" />
              </div>
              <p className="ui-heading">No brand templates yet</p>
              <p className="ui-description mt-2">Create one to make PCI styling available in the QR builder.</p>
            </div>
          ) : null}
        </section>

        <section className="xl:sticky xl:top-8 xl:h-fit">
          <div className="mb-4 flex items-center gap-3">
            <span className="ui-section-icon">
              <Icon name="plus" className="h-4 w-4" />
            </span>
            <div>
              <h2 className="ui-heading">New template</h2>
              <p className="text-sm text-[var(--muted)]">Save a reusable brand preset.</p>
            </div>
          </div>
          <TemplateForm />
        </section>
      </div>
    </div>
  );
}
