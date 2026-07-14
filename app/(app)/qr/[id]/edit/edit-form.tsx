"use client";

import { useActionState, useState } from "react";
import { updateQrCode, type EditQrState } from "./actions";
import { QrPreview } from "@/components/qr-preview";
import { Icon, type IconName } from "@/components/ui-icons";
import { ContentFields } from "@/components/qr-content-fields";
import { qrTypeValues, type QrTypeValue } from "@/lib/qr-content";
import { dotStyleValues, cornerStyleValues, type StyleConfig } from "@/lib/qr-style";

type TemplateOption = {
  id: string;
  name: string;
  foreground: string;
  background: string;
  dotStyle: string | null;
  cornerStyle: string | null;
  logoUrl: string | null;
  isDefault: boolean;
};

type QrData = {
  id: string;
  type: QrTypeValue;
  label: string;
  tags: string;
  shortcode: string;
  brandTemplateId: string | null;
  fields: Record<string, string>;
  style: StyleConfig;
};

const initialState: EditQrState = {};

const typeLabels: Record<QrTypeValue, string> = {
  URL: "Website / URL",
  VCARD: "Contact card (vCard)",
  WIFI: "Wi-Fi network",
  TEXT: "Plain text",
  EMAIL: "Email",
  PHONE: "Phone number",
};

const typeMeta: Record<QrTypeValue, { icon: IconName; description: string }> = {
  URL: { icon: "globe", description: "Landing pages, listings, portals" },
  VCARD: { icon: "shield", description: "Agent contact cards" },
  WIFI: { icon: "wifi", description: "Office or event Wi-Fi" },
  TEXT: { icon: "type", description: "Plain notes or instructions" },
  EMAIL: { icon: "mail", description: "Pre-filled enquiries" },
  PHONE: { icon: "phone", description: "Tap-to-call campaigns" },
};

export function EditForm({ qr, templates }: { qr: QrData; templates: TemplateOption[] }) {
  const [state, formAction, pending] = useActionState(updateQrCode, initialState);

  const [type, setType] = useState<QrTypeValue>(qr.type);
  const [fields, setFields] = useState<Record<string, string>>(qr.fields);
  const [templateId, setTemplateId] = useState(qr.brandTemplateId ?? "");
  const [style, setStyle] = useState<StyleConfig>(qr.style);

  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";
  const previewData = `${redirectBase}/q/${qr.shortcode}`;

  function setField(name: string, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
  }

  function applyTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((tpl) => tpl.id === id);
    if (!t) return;
    setStyle({
      foreground: t.foreground,
      background: t.background,
      dotStyle: (t.dotStyle as StyleConfig["dotStyle"]) ?? "square",
      cornerStyle: (t.cornerStyle as StyleConfig["cornerStyle"]) ?? "square",
      logoUrl: t.logoUrl,
      margin: 8,
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={qr.id} />
        <input type="hidden" name="brandTemplateId" value={templateId} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="foreground" value={style.foreground} />
        <input type="hidden" name="background" value={style.background} />
        <input type="hidden" name="dotStyle" value={style.dotStyle} />
        <input type="hidden" name="cornerStyle" value={style.cornerStyle} />
        <input type="hidden" name="logoUrl" value={style.logoUrl ?? ""} />
        <input type="hidden" name="margin" value={style.margin} />

        <section className="ui-form-section p-5 sm:p-6">
          <div className="ui-section-title">
            <span className="ui-section-icon">
              <Icon name="qr" className="h-4 w-4" />
            </span>
            <div>
              <h2 className="ui-heading">QR job</h2>
              <p className="ui-description mt-1">Change the action only when the printed code should behave differently.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {qrTypeValues.map((t) => {
              const selected = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setFields({});
                  }}
                  className={selected ? "ui-type-card ui-type-card-active" : "ui-type-card"}
                  aria-pressed={selected}
                >
                  <span className="flex items-start gap-3">
                    <span className="ui-section-icon h-9 w-9">
                      <Icon name={typeMeta[t].icon} className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-[var(--foreground)]">{typeLabels[t]}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{typeMeta[t].description}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="ui-form-section p-5 sm:p-6">
          <div className="ui-section-title">
            <span className="ui-section-icon">
              <Icon name="fileText" className="h-4 w-4" />
            </span>
            <div>
              <h2 className="ui-heading">Campaign details</h2>
              <p className="ui-description mt-1">The tracking link stays locked; these fields update the destination and library record.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="ui-label">Label</label>
              <input name="label" required defaultValue={qr.label} className="ui-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ui-label">Tags</label>
              <input name="tags" defaultValue={qr.tags} className="ui-input" />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <ContentFields type={type} fields={fields} setField={setField} />
          </div>
        </section>

        <section className="ui-form-section p-5 sm:p-6">
          <div className="ui-section-title">
            <span className="ui-section-icon">
              <Icon name="palette" className="h-4 w-4" />
            </span>
            <div>
              <h2 className="ui-heading">Brand styling</h2>
              <p className="ui-description mt-1">Change the brand template or fine-tune the saved QR styling.</p>
            </div>
          </div>
          {templates.length > 0 ? (
            <div className="mt-5 flex flex-col gap-1.5">
              <label className="ui-label">Brand template</label>
              <select
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="ui-select"
              >
                <option value="">Custom (no template)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="ui-label">Foreground</label>
              <input
                type="color"
                value={style.foreground}
                onChange={(e) => setStyle((s) => ({ ...s, foreground: e.target.value }))}
                className="ui-color"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ui-label">Background</label>
              <input
                type="color"
                value={style.background}
                onChange={(e) => setStyle((s) => ({ ...s, background: e.target.value }))}
                className="ui-color"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="ui-label">Dot style</label>
              <select
                value={style.dotStyle}
                onChange={(e) =>
                  setStyle((s) => ({ ...s, dotStyle: e.target.value as StyleConfig["dotStyle"] }))
                }
                className="ui-select"
              >
                {dotStyleValues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="ui-label">Corner style</label>
              <select
                value={style.cornerStyle}
                onChange={(e) =>
                  setStyle((s) => ({ ...s, cornerStyle: e.target.value as StyleConfig["cornerStyle"] }))
                }
                className="ui-select"
              >
                {cornerStyleValues.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {state.error ? <p className="rounded-xl bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">{state.error}</p> : null}

        <div className="ui-toolbar flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            Shortcode <span className="font-mono font-semibold text-[var(--foreground)]">{qr.shortcode}</span> remains unchanged for printed materials.
          </p>
          <button type="submit" disabled={pending} className="ui-button ui-button-solid">
            <Icon name="edit" className="h-4 w-4" />
            {pending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <aside className="ui-card h-fit overflow-hidden p-5 xl:sticky xl:top-8">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="ui-heading">Live proof</p>
            <p className="mt-1 text-sm text-[var(--muted)]">The shortcode remains locked for printed materials.</p>
          </div>
          <span className="ui-badge">Active edit</span>
        </div>
        <div className="ui-qr-stage flex justify-center p-6">
          <QrPreview data={previewData} style={style} size={220} />
        </div>
        <p className="mt-4 break-all rounded-xl bg-[var(--card-subtle)] px-3 py-2 text-center font-mono text-xs text-[var(--muted)]">
          {previewData}
        </p>
        <div className="mt-5 grid gap-3 text-sm">
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
            <span className="text-[var(--muted)]">Type</span>
            <span className="font-semibold text-[var(--foreground)]">{typeLabels[type]}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] px-3 py-2">
            <span className="text-[var(--muted)]">Template</span>
            <span className="max-w-36 truncate font-semibold text-[var(--foreground)]">
              {templates.find((t) => t.id === templateId)?.name ?? "Custom"}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
