import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { QrPreview } from "@/components/qr-preview";
import { styleConfigSchema } from "@/lib/qr-style";
import { qrTypeValues } from "@/lib/qr-content";
import { cloneQrCode, setQrStatus, deleteQrCode } from "./actions";

type SearchParams = {
  q?: string;
  type?: string;
  tag?: string;
  status?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status ?? "ACTIVE";

  const where: Prisma.QrCodeWhereInput = {};
  if (status !== "ALL") {
    where.status = status as "ACTIVE" | "ARCHIVED";
  }
  if (params.type && qrTypeValues.includes(params.type as never)) {
    where.type = params.type as (typeof qrTypeValues)[number];
  }
  if (params.tag) {
    where.tags = { has: params.tag };
  }
  if (params.q) {
    where.OR = [
      { label: { contains: params.q, mode: "insensitive" } },
      { shortcode: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const qrCodes = await prisma.qrCode.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";

  return (
    <div className="space-y-6">
      <section className="ui-card overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ui-kicker">QR library</p>
            <h1 className="ui-title mt-2">Dynamic codes ready for print</h1>
            <p className="ui-description mt-3 max-w-2xl">
              Search active campaigns, clone proven codes, and keep destinations editable after the signs, flyers, or cards are already out.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="ui-badge ui-badge-muted">{qrCodes.length} shown</span>
            <Link href="/qr/new" className="ui-button ui-button-solid">
              New QR code
            </Link>
          </div>
        </div>
      </section>

      <form method="get" className="ui-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_0.85fr_auto]">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="Search label or code..."
          className="ui-input"
        />
        <select name="type" defaultValue={params.type ?? ""} className="ui-select">
          <option value="">All types</option>
          {qrTypeValues.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="tag"
          defaultValue={params.tag}
          placeholder="Tag..."
          className="ui-input"
        />
        <select name="status" defaultValue={status} className="ui-select">
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
          <option value="ALL">All</option>
        </select>
        <button type="submit" className="ui-button ui-button-surface">
          Filter
        </button>
      </form>

      <div className="grid gap-3">
        {qrCodes.map((qr) => {
          const style = styleConfigSchema.parse(qr.styleConfig);
          const trackingUrl = `${redirectBase}/q/${qr.shortcode}`;
          return (
            <article key={qr.id} className="ui-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="ui-preview-pad flex h-20 w-20 shrink-0 items-center justify-center p-2">
                <QrPreview data={trackingUrl} style={style} size={56} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/qr/${qr.id}`} className="text-base font-bold tracking-[-0.02em] text-neutral-950 hover:text-[var(--accent)]">
                    {qr.label}
                  </Link>
                  <span className={qr.status === "ACTIVE" ? "ui-badge" : "ui-badge ui-badge-muted"}>
                    {qr.status.toLowerCase()}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-neutral-500">
                  {qr.type} &middot; {qr.shortcode}
                  {qr.tags.length > 0 ? ` · ${qr.tags.join(", ")}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-sm">
                <Link href={`/qr/${qr.id}/edit`} className="ui-button ui-button-plain">
                  Edit
                </Link>
                <form action={cloneQrCode.bind(null, qr.id)}>
                  <button type="submit" className="ui-button ui-button-plain">
                    Clone
                  </button>
                </form>
                <form action={setQrStatus.bind(null, qr.id, qr.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE")}>
                  <button type="submit" className="ui-button ui-button-plain">
                    {qr.status === "ACTIVE" ? "Archive" : "Unarchive"}
                  </button>
                </form>
                <form action={deleteQrCode.bind(null, qr.id)}>
                  <button type="submit" className="ui-button ui-button-plain ui-button-danger">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          );
        })}
        {qrCodes.length === 0 ? (
          <div className="ui-card p-8 text-center">
            <p className="ui-heading">No QR codes found</p>
            <p className="ui-description mt-2">Adjust the filters or create a new dynamic code.</p>
            <Link href="/qr/new" className="ui-button ui-button-solid mt-5">
              Create QR code
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
