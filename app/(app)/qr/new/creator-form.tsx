"use client";

import { useActionState, useMemo, useState } from "react";
import { createQrCode, type CreateQrState } from "./actions";
import { QrPreview } from "@/components/qr-preview";
import { ContentFields } from "@/components/qr-content-fields";
import { qrTypeValues, type QrTypeValue } from "@/lib/qr-content";
import { dotStyleValues, cornerStyleValues, type StyleConfig } from "@/lib/qr-style";
import { generateShortcode } from "@/lib/shortcode";

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

const initialState: CreateQrState = {};

const typeLabels: Record<QrTypeValue, string> = {
  URL: "Website / URL",
  VCARD: "Contact card (vCard)",
  WIFI: "Wi-Fi network",
  TEXT: "Plain text",
  EMAIL: "Email",
  PHONE: "Phone number",
};

export function CreatorForm({ templates }: { templates: TemplateOption[] }) {
  const [state, formAction, pending] = useActionState(createQrCode, initialState);
  const defaultTemplate = templates.find((t) => t.isDefault) ?? templates[0];

  const [type, setType] = useState<QrTypeValue>("URL");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [templateId, setTemplateId] = useState(defaultTemplate?.id ?? "");
  const [style, setStyle] = useState<StyleConfig>(() => ({
    foreground: defaultTemplate?.foreground ?? "#0B2545",
    background: defaultTemplate?.background ?? "#FFFFFF",
    dotStyle: (defaultTemplate?.dotStyle as StyleConfig["dotStyle"]) ?? "square",
    cornerStyle: (defaultTemplate?.cornerStyle as StyleConfig["cornerStyle"]) ?? "square",
    logoUrl: defaultTemplate?.logoUrl ?? null,
    margin: 8,
  }));

  const shortcode = useMemo(() => generateShortcode(), []);
  const redirectBase = process.env.NEXT_PUBLIC_REDIRECT_BASE_URL ?? "";
  const previewData = `${redirectBase}/q/${shortcode}`;

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <form action={formAction} className="ui-card flex flex-col gap-5 p-5 sm:p-6">
        <input type="hidden" name="shortcode" value={shortcode} />
        <input type="hidden" name="brandTemplateId" value={templateId} />
        <input type="hidden" name="foreground" value={style.foreground} />
        <input type="hidden" name="background" value={style.background} />
        <input type="hidden" name="dotStyle" value={style.dotStyle} />
        <input type="hidden" name="cornerStyle" value={style.cornerStyle} />
        <input type="hidden" name="logoUrl" value={style.logoUrl ?? ""} />
        <input type="hidden" name="margin" value={style.margin} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="ui-label">Type</label>
            <select
              name="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as QrTypeValue);
                setFields({});
              }}
              className="ui-select"
            >
              {qrTypeValues.map((t) => (
                <option key={t} value={t}>
                  {typeLabels[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="ui-label">Label</label>
            <input
              name="label"
              required
              placeholder="e.g. 123 Main St yard sign"
              className="ui-input"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ContentFields type={type} fields={fields} setField={setField} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="ui-label">Tags (comma separated)</label>
          <input name="tags" placeholder="listing-123, yard-sign" className="ui-input" />
        </div>

        <div className="ui-card-subtle p-4">
          <div className="mb-4 flex flex-col gap-1">
            <p className="ui-heading">Branding</p>
            <p className="text-sm text-neutral-500">Choose a saved template or tune the QR appearance for this code.</p>
          </div>
          {templates.length > 0 ? (
            <div className="mb-4 flex flex-col gap-1.5">
              <label className="ui-label">Brand template</label>
              <select value={templateId} onChange={(e) => applyTemplate(e.target.value)} className="ui-select">
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
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
          {style.logoUrl ? (
            <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs text-neutral-500">
              Logo from template applied. Error correction is automatically raised to level H.
            </p>
          ) : null}
        </div>

        {state.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

        <button type="submit" disabled={pending} className="ui-button ui-button-solid w-fit">
          {pending ? "Creating…" : "Create QR code"}
        </button>
      </form>

      <aside className="ui-card h-fit p-5 lg:sticky lg:top-28">
        <div className="mb-4">
          <p className="ui-heading">Live preview</p>
          <p className="mt-1 text-sm text-neutral-500">This is the tracking code that will be printed.</p>
        </div>
        <div className="ui-preview-pad flex justify-center p-6">
          <QrPreview data={previewData} style={style} size={220} />
        </div>
        <p className="mt-4 break-all rounded-xl bg-neutral-50 px-3 py-2 text-center font-mono text-xs text-neutral-500">
          {previewData}
        </p>
      </aside>
    </div>
  );
}
