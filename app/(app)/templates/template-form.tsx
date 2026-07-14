"use client";

import { useActionState, useState } from "react";
import { createBrandTemplate, type TemplateFormState } from "./actions";
import { QrPreview } from "@/components/qr-preview";
import { dotStyleValues, cornerStyleValues, type StyleConfig } from "@/lib/qr-style";

const initialState: TemplateFormState = {};

export function TemplateForm() {
  const [state, formAction, pending] = useActionState(createBrandTemplate, initialState);
  const [foreground, setForeground] = useState("#0B2545");
  const [background, setBackground] = useState("#FFFFFF");
  const [dotStyle, setDotStyle] = useState<StyleConfig["dotStyle"]>("rounded");
  const [cornerStyle, setCornerStyle] = useState<StyleConfig["cornerStyle"]>("extra-rounded");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/uploads/logo", { method: "POST", body });
      const json = await res.json();
      if (res.ok) {
        setLogoUrl(json.url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="ui-card mt-4 grid gap-6 p-5">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="logoUrl" value={logoUrl ?? ""} />

        <div className="flex flex-col gap-1.5">
          <label className="ui-label">Name</label>
          <input
            name="name"
            required
            className="ui-input"
            placeholder="e.g. PCI Standard"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="ui-label">Foreground</label>
            <input
              type="color"
              name="foreground"
              value={foreground}
              onChange={(e) => setForeground(e.target.value)}
              className="ui-color"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="ui-label">Background</label>
            <input
              type="color"
              name="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="ui-color"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="ui-label">Dot style</label>
            <select
              name="dotStyle"
              value={dotStyle}
              onChange={(e) => setDotStyle(e.target.value as StyleConfig["dotStyle"])}
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
              name="cornerStyle"
              value={cornerStyle}
              onChange={(e) => setCornerStyle(e.target.value as StyleConfig["cornerStyle"])}
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

        <div className="flex flex-col gap-1.5">
          <label className="ui-label">Logo (optional)</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoChange}
            className="ui-input file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-[var(--accent)]"
          />
          {uploading ? <p className="text-xs text-neutral-500">Uploading…</p> : null}
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
          <input type="checkbox" name="isDefault" className="ui-checkbox" />
          Make this the default template
        </label>

        {state.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}
        {state.success ? <p className="text-sm font-medium text-[var(--success)]">Template saved.</p> : null}

        <button
          type="submit"
          disabled={pending || uploading}
          className="ui-button ui-button-solid mt-1"
        >
          {pending ? "Saving…" : "Save template"}
        </button>
      </form>

      <div className="ui-card-subtle flex flex-col items-center gap-3 p-4">
        <p className="ui-label">Preview</p>
        <QrPreview
          data="https://pcirealestate.com"
          style={{ foreground, background, dotStyle, cornerStyle, logoUrl, margin: 8 }}
        />
      </div>
    </div>
  );
}
