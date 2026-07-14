import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QrPreview } from "@/components/qr-preview";
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-6">
        <section className="ui-card p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="ui-kicker">QR detail</p>
                <span className={qr.status === "ACTIVE" ? "ui-badge" : "ui-badge ui-badge-muted"}>
                  {qr.status.toLowerCase()}
                </span>
              </div>
              <h1 className="ui-title mt-2">{qr.label}</h1>
              <p className="ui-description mt-3 max-w-2xl">
                Review the destination, export print assets, and monitor scans for this dynamic code.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <Link href={`/qr/${qr.id}/edit`} className="ui-button ui-button-surface">
                Edit
              </Link>
              <form action={cloneQrCode.bind(null, qr.id)}>
                <button type="submit" className="ui-button ui-button-surface">
                  Clone
                </button>
              </form>
              <form action={setQrStatus.bind(null, qr.id, qr.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE")}>
                <button type="submit" className="ui-button ui-button-surface">
                  {qr.status === "ACTIVE" ? "Archive" : "Unarchive"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="ui-card p-5">
          <h2 className="ui-heading">Code settings</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="ui-card-subtle p-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Type</dt>
              <dd className="mt-1 font-semibold text-neutral-950">{qr.type}</dd>
            </div>
            <div className="ui-card-subtle p-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Status</dt>
              <dd className="mt-1 font-semibold text-neutral-950">{qr.status}</dd>
            </div>
            <div className="ui-card-subtle p-3 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Tracking link</dt>
              <dd className="mt-1 break-all font-mono text-xs text-neutral-950">{trackingUrl}</dd>
            </div>
            <div className="ui-card-subtle p-3 sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Destination</dt>
              <dd className="mt-1 break-all text-neutral-950">{qr.destinationUrl}</dd>
            </div>
            {qr.tags.length > 0 ? (
              <div className="ui-card-subtle p-3 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Tags</dt>
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
          <div>
            <p className="ui-kicker">Analytics</p>
            <h2 className="ui-heading mt-1">Scan analytics</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Total scans" value={summary.total} />
            <StatTile label="Last 7 days" value={summary.last7Days} />
            <StatTile
              label="Last scan"
              value={summary.lastScanAt ? summary.lastScanAt.toLocaleDateString() : "—"}
            />
          </div>

          <div className="ui-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Scans, last 30 days</p>
            <ScanTimeSeriesChart data={series} />
          </div>

          <div className="ui-card p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Scans by device</p>
            {breakdown.length > 0 ? (
              <DeviceBreakdownChart data={breakdown} />
            ) : (
              <p className="text-sm text-neutral-500">No scans yet.</p>
            )}
          </div>
        </section>
      </div>

      <aside className="ui-card h-fit p-5 lg:sticky lg:top-28">
        <div className="mb-4">
          <p className="ui-heading">Print proof</p>
          <p className="mt-1 text-sm text-neutral-500">Export exact assets for signs, flyers, or PDF packets.</p>
        </div>
        <div className="ui-preview-pad flex justify-center p-6">
          <QrPreview data={trackingUrl} style={style} size={220} />
        </div>
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Export</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <a
              href={`/api/qr/${qr.id}/export?format=svg`}
              className="ui-button ui-button-surface"
            >
              SVG
            </a>
            <a
              href={`/api/qr/${qr.id}/export?format=png&size=512`}
              className="ui-button ui-button-surface"
            >
              PNG 512
            </a>
            <a
              href={`/api/qr/${qr.id}/export?format=png&size=1024`}
              className="ui-button ui-button-surface"
            >
              PNG 1024
            </a>
            <a
              href={`/api/qr/${qr.id}/export?format=png&size=2048`}
              className="ui-button ui-button-surface"
            >
              PNG 2048
            </a>
            <a
              href={`/api/qr/${qr.id}/export?format=pdf`}
              className="ui-button ui-button-solid col-span-2"
            >
              PDF
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="ui-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-neutral-950">{value}</p>
    </div>
  );
}
