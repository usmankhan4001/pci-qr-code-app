import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { QrPreview } from "@/components/qr-preview";
import { Icon, type IconName } from "@/components/ui-icons";
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [qrCodes, totalCodes, activeCodes, archivedCodes, scansLast30] = await Promise.all([
    prisma.qrCode.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.qrCode.count(),
    prisma.qrCode.count({ where: { status: "ACTIVE" } }),
    prisma.qrCode.count({ where: { status: "ARCHIVED" } }),
    prisma.scan.count({ where: { scannedAt: { gte: thirtyDaysAgo } } }),
  ]);

  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";

  return (
    <div className="ui-page-grid">
      <section className="ui-page-header">
        <div className="flex flex-col gap-6 p-5 sm:p-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="ui-page-eyebrow">QR library</p>
            <h1 className="ui-title mt-2">Dynamic codes ready for print</h1>
            <p className="ui-description mt-3 max-w-2xl">
              Search active campaigns, clone proven layouts, and keep destinations editable after signs, flyers, and cards are already in market.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="ui-badge ui-badge-gold justify-center">{qrCodes.length} shown</span>
            <Link href="/qr/new" className="ui-button ui-button-solid">
              <Icon name="plus" className="h-4 w-4" />
              New QR code
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="qr" label="Total codes" value={totalCodes} detail="All campaigns" />
        <MetricCard icon="scan" label="Active" value={activeCodes} detail="Live and editable" />
        <MetricCard icon="archive" label="Archived" value={archivedCodes} detail="Hidden from active work" />
        <MetricCard icon="barChart" label="30-day scans" value={scansLast30} detail="Across every QR" />
      </section>

      <form method="get" className="ui-toolbar grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_0.85fr_auto]">
        <div className="ui-search-field sm:col-span-2 lg:col-span-1">
          <Icon name="search" className="h-4 w-4" />
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Search by label or shortcode"
            className="ui-input"
          />
        </div>
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
          placeholder="Tag"
          className="ui-input"
        />
        <select name="status" defaultValue={status} className="ui-select">
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
          <option value="ALL">All</option>
        </select>
        <button type="submit" className="ui-button ui-button-surface">
          <Icon name="filter" className="h-4 w-4" />
          Filter
        </button>
      </form>

      <section className="grid gap-3">
        {qrCodes.map((qr) => {
          const style = styleConfigSchema.parse(qr.styleConfig);
          const trackingUrl = `${redirectBase}/q/${qr.shortcode}`;
          return (
            <article key={qr.id} className="ui-data-row p-3 sm:p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="ui-preview-pad flex h-20 w-20 shrink-0 items-center justify-center p-2">
                    <QrPreview data={trackingUrl} style={style} size={56} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/qr/${qr.id}`} className="truncate text-base font-bold tracking-[-0.02em] text-[var(--foreground)] hover:text-[var(--accent)]">
                        {qr.label}
                      </Link>
                      <span className={qr.status === "ACTIVE" ? "ui-badge" : "ui-badge ui-badge-muted"}>
                        {qr.status.toLowerCase()}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name={typeIcon(qr.type)} className="h-4 w-4" />
                        {qr.type}
                      </span>
                      <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-xs">
                        <Icon name="link" className="h-3.5 w-3.5" />
                        {qr.shortcode}
                      </span>
                      {qr.tags.length > 0 ? (
                        <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                          <Icon name="tag" className="h-3.5 w-3.5" />
                          {qr.tags.join(", ")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                  <Link href={`/qr/${qr.id}`} className="ui-button ui-button-surface">
                    <Icon name="externalLink" className="h-4 w-4" />
                    Open
                  </Link>
                  <Link href={`/qr/${qr.id}/edit`} className="ui-icon-button" aria-label={`Edit ${qr.label}`}>
                    <Icon name="edit" className="h-4 w-4" />
                  </Link>
                  <form action={cloneQrCode.bind(null, qr.id)}>
                    <button type="submit" className="ui-icon-button" aria-label={`Clone ${qr.label}`}>
                      <Icon name="clone" className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={setQrStatus.bind(null, qr.id, qr.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE")}>
                    <button type="submit" className="ui-icon-button" aria-label={qr.status === "ACTIVE" ? `Archive ${qr.label}` : `Unarchive ${qr.label}`}>
                      <Icon name="archive" className="h-4 w-4" />
                    </button>
                  </form>
                  <form action={deleteQrCode.bind(null, qr.id)}>
                    <button type="submit" className="ui-icon-button text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]" aria-label={`Delete ${qr.label}`}>
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </article>
          );
        })}
        {qrCodes.length === 0 ? (
          <div className="ui-empty">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
              <Icon name="search" className="h-5 w-5" />
            </div>
            <p className="ui-heading">No QR codes found</p>
            <p className="ui-description mt-2">Adjust the filters or create a new dynamic code.</p>
            <Link href="/qr/new" className="ui-button ui-button-solid mt-5">
              <Icon name="plus" className="h-4 w-4" />
              Create QR code
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, detail }: { icon: IconName; label: string; value: string | number; detail: string }) {
  return (
    <div className="ui-metric-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">{value}</p>
          <p className="mt-1 text-xs font-medium text-[var(--muted)]">{detail}</p>
        </div>
        <span className="ui-section-icon">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function typeIcon(type: string): IconName {
  switch (type) {
    case "URL":
      return "globe";
    case "VCARD":
      return "shield";
    case "WIFI":
      return "wifi";
    case "TEXT":
      return "type";
    case "EMAIL":
      return "mail";
    case "PHONE":
      return "phone";
    default:
      return "qr";
  }
}
