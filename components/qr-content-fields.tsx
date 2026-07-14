"use client";

import { Checkbox, Select, TextInput } from "@mantine/core";
import type { QrTypeValue } from "@/lib/qr-content";

type FieldInputProps = Pick<React.ComponentProps<typeof TextInput>, "type" | "placeholder" | "required">;

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
    props: FieldInputProps = {}
  ) => (
    <TextInput
      label={label}
      name={formName}
      value={fields[name] ?? ""}
      onChange={(event) => setField(name, event.currentTarget.value)}
      {...props}
    />
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
          <Select
            label="Encryption"
            name="content_encryption"
            value={fields.encryption ?? "WPA"}
            onChange={(value) => setField("encryption", value ?? "WPA")}
            data={[
              { value: "WPA", label: "WPA/WPA2" },
              { value: "WEP", label: "WEP" },
              { value: "nopass", label: "Open (no password)" },
            ]}
          />
          <Checkbox name="content_hidden" defaultChecked={fields.hidden === "true"} label="Hidden network" mt={26} />
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
