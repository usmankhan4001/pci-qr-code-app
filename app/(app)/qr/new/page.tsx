import { prisma } from "@/lib/prisma";
import { CreatorForm } from "./creator-form";

export default async function NewQrPage() {
  const templates = await prisma.brandTemplate.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6">
      <section className="ui-card p-6">
        <p className="ui-kicker">Create QR</p>
        <h1 className="ui-title mt-2">Build a branded dynamic code</h1>
        <p className="ui-description mt-3 max-w-2xl">
          Every QR encodes a short PCI tracking link, so the printed code stays the same while the destination can change later.
        </p>
      </section>
      <div>
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
    </div>
  );
}
