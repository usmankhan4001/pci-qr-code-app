import { prisma } from "@/lib/prisma";
import { deleteBrandTemplate } from "./actions";
import { TemplateForm } from "./template-form";
import { QrPreview } from "@/components/qr-preview";

export default async function TemplatesPage() {
  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <section className="ui-card p-6">
        <p className="ui-kicker">Brand system</p>
        <h1 className="ui-title mt-2">Brand templates</h1>
        <p className="ui-description mt-3 max-w-2xl">
          Presets for PCI colors, dot styles, and logo so staff do not have to pick brand values by hand.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <section className="space-y-4">
          {templates.map((template) => (
            <article key={template.id} className="ui-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
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
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold tracking-[-0.02em] text-neutral-950">
                    {template.name}
                  </p>
                  {template.isDefault ? <span className="ui-badge">Default</span> : null}
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {template.foreground} on {template.background} &middot; {template.dotStyle}/{template.cornerStyle}
                </p>
              </div>
              <form action={deleteBrandTemplate.bind(null, template.id)}>
                <button type="submit" className="ui-button ui-button-plain ui-button-danger">
                  Delete
                </button>
              </form>
            </article>
          ))}
          {templates.length === 0 ? (
            <div className="ui-card p-8 text-center">
              <p className="ui-heading">No brand templates yet</p>
              <p className="ui-description mt-2">Create one to make PCI styling available in the QR builder.</p>
            </div>
          ) : null}
        </section>

        <section>
          <h2 className="ui-heading">New template</h2>
          <TemplateForm />
        </section>
      </div>
    </div>
  );
}
