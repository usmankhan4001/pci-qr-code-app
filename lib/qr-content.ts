import { z } from "zod";

export const qrTypeValues = ["URL", "VCARD", "WIFI", "TEXT", "EMAIL", "PHONE"] as const;
export type QrTypeValue = (typeof qrTypeValues)[number];

export const contentSchemas = {
  URL: z.object({
    url: z.string().url("Enter a valid URL, including https://"),
  }),
  TEXT: z.object({
    text: z.string().min(1, "Text is required"),
  }),
  PHONE: z.object({
    phone: z.string().min(1, "Phone number is required"),
  }),
  EMAIL: z.object({
    to: z.string().email("Enter a valid email address"),
    subject: z.string().optional(),
    body: z.string().optional(),
  }),
  WIFI: z.object({
    ssid: z.string().min(1, "Network name is required"),
    password: z.string().optional(),
    encryption: z.enum(["WPA", "WEP", "nopass"]).default("WPA"),
    hidden: z.boolean().default(false),
  }),
  VCARD: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    org: z.string().optional(),
    title: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
  }),
} as const;

export type ContentConfigFor<T extends QrTypeValue> = z.infer<(typeof contentSchemas)[T]>;

function escapeVCard(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

function escapeWifi(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/:/g, "\\:");
}

/**
 * Renders the type-specific contentConfig into the raw value that would
 * traditionally be encoded directly into a QR (mailto:, tel:, vCard text,
 * WIFI: config string, or plain text). For URL this is just the URL itself.
 * The redirect handler (/q/[slug]) uses this to know how to respond:
 * URL/EMAIL/PHONE get a 302 to this value, the rest get served as content
 * with an appropriate Content-Type.
 */
export function buildDestinationValue(type: QrTypeValue, contentConfig: unknown): string {
  switch (type) {
    case "URL": {
      const { url } = contentSchemas.URL.parse(contentConfig);
      return url;
    }
    case "TEXT": {
      const { text } = contentSchemas.TEXT.parse(contentConfig);
      return text;
    }
    case "PHONE": {
      const { phone } = contentSchemas.PHONE.parse(contentConfig);
      return `tel:${phone.replace(/[^+\d]/g, "")}`;
    }
    case "EMAIL": {
      const { to, subject, body } = contentSchemas.EMAIL.parse(contentConfig);
      const params = new URLSearchParams();
      if (subject) params.set("subject", subject);
      if (body) params.set("body", body);
      const query = params.toString();
      return `mailto:${to}${query ? `?${query}` : ""}`;
    }
    case "WIFI": {
      const { ssid, password, encryption, hidden } = contentSchemas.WIFI.parse(contentConfig);
      const pw = encryption === "nopass" ? "" : `P:${escapeWifi(password ?? "")};`;
      return `WIFI:T:${encryption};S:${escapeWifi(ssid)};${pw}H:${hidden ? "true" : "false"};;`;
    }
    case "VCARD": {
      const { firstName, lastName, org, title, phone, email } = contentSchemas.VCARD.parse(contentConfig);
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escapeVCard(lastName ?? "")};${escapeVCard(firstName)};;;`,
        `FN:${escapeVCard([firstName, lastName].filter(Boolean).join(" "))}`,
      ];
      if (org) lines.push(`ORG:${escapeVCard(org)}`);
      if (title) lines.push(`TITLE:${escapeVCard(title)}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(phone)}`);
      if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
  }
}

/**
 * Inverse of the form extraction done in the create/edit server actions:
 * turns a persisted contentConfig back into the flat field-state shape the
 * client form components (ContentFields) expect, so the editor can
 * pre-populate inputs for an existing QR code.
 */
export function contentConfigToFieldState(type: QrTypeValue, contentConfig: unknown): Record<string, string> {
  switch (type) {
    case "URL": {
      const { url } = contentSchemas.URL.parse(contentConfig);
      return { url };
    }
    case "TEXT": {
      const { text } = contentSchemas.TEXT.parse(contentConfig);
      return { text };
    }
    case "PHONE": {
      const { phone } = contentSchemas.PHONE.parse(contentConfig);
      return { phone };
    }
    case "EMAIL": {
      const { to, subject, body } = contentSchemas.EMAIL.parse(contentConfig);
      return { to, subject: subject ?? "", body: body ?? "" };
    }
    case "WIFI": {
      const { ssid, password, encryption, hidden } = contentSchemas.WIFI.parse(contentConfig);
      return { ssid, password: password ?? "", encryption, hidden: hidden ? "true" : "false" };
    }
    case "VCARD": {
      const { firstName, lastName, org, title, phone, email } = contentSchemas.VCARD.parse(contentConfig);
      return {
        firstName,
        lastName: lastName ?? "",
        org: org ?? "",
        title: title ?? "",
        phoneVcard: phone ?? "",
        emailVcard: email ?? "",
      };
    }
  }
}
