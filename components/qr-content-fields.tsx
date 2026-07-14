"use client";

import type { QrTypeValue } from "@/lib/qr-content";

export function ContentFields({
  type,
  fields,
  setField,
}: {
  type: QrTypeValue;
  fields: Record<string, string>;
  setField: (name: string, value: string) => void;
}) {
  const input = (
    name: string,
    label: string,
    formName: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="ui-label">{label}</label>
      <input
        name={formName}
        value={fields[name] ?? ""}
        onChange={(e) => setField(name, e.target.value)}
        className="ui-input"
        {...props}
      />
    </div>
  );

  switch (type) {
    case "URL":
      return input("url", "Destination URL", "content_url", {
        type: "url",
        placeholder: "https://pcirealestate.com/listing/123",
        required: true,
      });
    case "TEXT":
      return input("text", "Text", "content_text", { required: true });
    case "PHONE":
      return input("phone", "Phone number", "content_phone", { required: true, placeholder: "+1 555 555 5555" });
    case "EMAIL":
      return (
        <>
          {input("to", "To", "content_to", { type: "email", required: true })}
          {input("subject", "Subject (optional)", "content_subject")}
          {input("body", "Body (optional)", "content_body")}
        </>
      );
    case "WIFI":
      return (
        <>
          {input("ssid", "Network name (SSID)", "content_ssid", { required: true })}
          {input("password", "Password", "content_password", { type: "password" })}
          <div className="flex flex-col gap-1.5">
            <label className="ui-label">Encryption</label>
            <select
              name="content_encryption"
              value={fields.encryption ?? "WPA"}
              onChange={(e) => setField("encryption", e.target.value)}
              className="ui-select"
            >
              <option value="WPA">WPA/WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Open (no password)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              name="content_hidden"
              defaultChecked={fields.hidden === "true"}
              className="ui-checkbox"
            />
            Hidden network
          </label>
        </>
      );
    case "VCARD":
      return (
        <>
          {input("firstName", "First name", "content_firstName", { required: true })}
          {input("lastName", "Last name", "content_lastName")}
          {input("org", "Organization", "content_org", { placeholder: "Premier Choice International" })}
          {input("title", "Title", "content_title")}
          {input("phoneVcard", "Phone", "content_phone_vcard")}
          {input("emailVcard", "Email", "content_email_vcard", { type: "email" })}
        </>
      );
  }
}
