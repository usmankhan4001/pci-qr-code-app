import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QrPreview } from "@/components/qr-preview";
import { Icon, type IconName } from "@/components/ui-icons";
import { styleConfigSchema } from "@/lib/qr-style";
import { cloneQrCode, setQrStatus } from "@/app/(app)/dashboard/actions";
import { getScanSummary, getScanTimeSeries, getDeviceBreakdown } from "@/lib/analytics";
import { ScanTimeSeriesChart, DeviceBreakdownChart } from "@/components/scan-charts";

export default async function QrDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr) notFound();

  const style = styleConfigSchema.parse(qr.styleConfig);
  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";
  const trackingUrl = `${redirectBase}/q/${qr.shortcode}`;

  const [summary, series, breakdown] = await Promise.all([
    getScanSummary(qr.id),
    getScanTimeSeries(qr.id, 30),
    getDeviceBreakdown(qr.id),
  ]);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="space-y-6">
        <section className="ui-page-header p-5 sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="ui-page-eyebrow">QR detail</p>
                <span className={qr.status === "ACTIVE" ? "ui-badge" : "ui-badge ui-badge-muted"}>
                  {qr.status.toLowerCase()}
                </span>
              </div>
              <h1 className="ui-title mt-2">{qr.label}</h1>
              <p className="ui-description mt-3 max-w-2xl">
                Review the destination, export print assets, and monitor scans for this dynamic code.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link href={`/qr/${qr.id}/edit`} className="ui-button ui-button-surface">
                <Icon name="edit" className="h-4 w-4" />
                Edit
              </Link>
              <form action={cloneQrCode.bind(null, qr.id)}>
                <button type="submit" className="ui-button ui-button-surface">
                  <Icon name="clone" className="h-4 w-4" />
                  Clone
                </button>
              </form>
              <form action={setQrStatus.bind(null, qr.id, qr.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE")}>
                <button type="submit" className="ui-button ui-button-surface">
                  <Icon name="archive" className="h-4 w-4" />
                  {qr.status === "ACTIVE" ? "Archive" : "Unarchive"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="ui-card p-5">
          <div className="ui-section-title">
            <span className="ui-section-icon">
              <Icon name="shield" className="h-4 w-4" />
            </span>
            <div>
              <h2 className="ui-heading">Code settings</h2>
              <p className="ui-description mt-1">Operational details for this printed asset.</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <DetailItem icon="qr" label="Type" value={qr.type} />
            <DetailItem icon="scan" label="Status" value={qr.status} />
            <DetailItem icon="link" label="Tracking link" value={trackingUrl} wide mono />
            <DetailItem icon="externalLink" label="Destination" value={qr.destinationUrl} wide />
            {qr.tags.length > 0 ? (
              <div className="ui-card-subtle p-4 sm:col-span-2">
                <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <Icon name="tag" className="h-3.5 w-3.5" />
                  Tags
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {qr.tags.map((tag) => (
                    <span key={tag} className="ui-badge ui-badge-muted">
                      {tag}
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="ui-page-eyebrow">Analytics</p>
              <h2 className="ui-heading mt-1">Scan analytics</h2>
            </div>
            <span className="ui-badge ui-badge-muted">Last 30 days</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile icon="scan" label="Total scans" value={summary.total} />
            <StatTile icon="barChart" label="Last 7 days" value={summary.last7Days} />
            <StatTile
              icon="bolt"
              label="Last scan"
              value={summary.lastScanAt ? summary.lastScanAt.toLocaleDateString() : "No scans"}
            />
          </div>

          <div className="ui-card p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              <Icon name="barChart" className="h-3.5 w-3.5" />
              Scans, last 30 days
            </p>
            <ScanTimeSeriesChart data={series} />
          </div>

          <div className="ui-card p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              <Icon name="phone" className="h-3.5 w-3.5" />
              Scans by device
            </p>
            {breakdown.length > 0 ? (
              <DeviceBreakdownChart data={breakdown} />
            ) : (
              <p className="text-sm text-[var(--muted)]">No scans yet.</p>
            )}
          </div>
        </section>
      </div>

      <aside className="ui-card h-fit overflow-hidden p-5 xl:sticky xl:top-8">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="ui-heading">Print proof</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Export exact assets for signs, flyers, or PDF packets.</p>
          </div>
          <span className="ui-badge ui-badge-gold">Ready</span>
        </div>
        <div className="ui-qr-stage flex justify-center p-6">
          <QrPreview data={trackingUrl} style={style} size={220} />
        </div>
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
            <Icon name="download" className="h-3.5 w-3.5" />
            Export
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <a
              href={`/api/qr/${qr.id}/export?format=svg`}
              className="ui-button ui-button-surface"
            >
              <Icon name="fileText" className="h-4 w-4" />
              SVG
            </a>
            <a
              href={`/api/qr/${qr.id}/export?format=png&size=512`}
              className="ui-button ui-button-surface"
            >
              <Icon name="image" className="h-4 w-4" />
              PNG 512
            </a>
            <a
              href={`/api/qr/${qr.id}/export?format=png&size=1024`}
              className="ui-button ui-button-surface"
            >
              <Icon name="image" className="h-4 w-4" />
              PNG 1024
            </a>
            <a
              href={`/api/qr/${qr.id}/export?format=png&size=2048`}
              className="ui-button ui-button-surface"
            >
              <Icon name="image" className="h-4 w-4" />
              PNG 2048
            </a>
            <a
              href={`/api/qr/${qr.id}/export?format=pdf`}
              className="ui-button ui-button-solid col-span-2"
            >
              <Icon name="download" className="h-4 w-4" />
              PDF
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DetailItem({ icon, label, value, wide = false, mono = false }: { icon: IconName; label: string; value: string; wide?: boolean; mono?: boolean }) {
  return (
    <div className={wide ? "ui-card-subtle p-4 sm:col-span-2" : "ui-card-subtle p-4"}>
      <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
        <Icon name={icon} className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className={mono ? "mt-2 break-all font-mono text-xs text-[var(--foreground)]" : "mt-2 break-all font-semibold text-[var(--foreground)]"}>
        {value}
      </dd>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: IconName; label: string; value: string | number }) {
  return (
    <div className="ui-metric-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[var(--foreground)]">{value}</p>
        </div>
        <span className="ui-section-icon">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
