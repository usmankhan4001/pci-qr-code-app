"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { qrTypeValues, contentSchemas, buildDestinationValue, type QrTypeValue } from "@/lib/qr-content";
import { styleConfigSchema } from "@/lib/qr-style";
import { resolveUniqueQrSlug } from "@/lib/qr-slug";
import { slugCandidateFromLabelOrUrl } from "@/lib/slug";

export type EditQrState = { error?: string };

const baseSchema = z.object({
  id: z.string(),
  type: z.enum(qrTypeValues),
  label: z.string().min(1, "Label is required"),
  slug: z.string().optional(),
  tags: z.string().optional(),
  brandTemplateId: z.string().optional(),
  foreground: z.string(),
  background: z.string(),
  dotStyle: z.string(),
  cornerStyle: z.string(),
  logoUrl: z.string().optional(),
  margin: z.coerce.number().optional(),
});

export async function updateQrCode(
  _prevState: EditQrState,
  formData: FormData
): Promise<EditQrState> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const base = baseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!base.success) {
    return { error: base.error.issues[0]?.message ?? "Invalid input" };
  }
  const { id, type, label, slug, tags, brandTemplateId, ...styleFields } = base.data;

  const style = styleConfigSchema.safeParse({
    foreground: styleFields.foreground,
    background: styleFields.background,
    dotStyle: styleFields.dotStyle,
    cornerStyle: styleFields.cornerStyle,
    logoUrl: styleFields.logoUrl || null,
    margin: styleFields.margin ?? 8,
  });
  if (!style.success) {
    return { error: style.error.issues[0]?.message ?? "Invalid style" };
  }

  const contentConfig = extractContentConfig(type, formData);
  const contentParsed = contentSchemas[type].safeParse(contentConfig);
  if (!contentParsed.success) {
    return { error: contentParsed.error.issues[0]?.message ?? "Invalid content" };
  }

  const destinationUrl = buildDestinationValue(type, contentParsed.data);
  const finalSlug = await resolveUniqueQrSlug(slug || slugCandidateFromLabelOrUrl(label, destinationUrl), id);

  await prisma.qrCode.update({
    where: { id },
    data: {
      slug: finalSlug,
      label,
      type,
      contentConfig: contentParsed.data,
      destinationUrl,
      styleConfig: style.data,
      tags: tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      brandTemplateId: brandTemplateId || null,
    },
  });

  redirect(`/qr/${id}`);
}

function extractContentConfig(type: QrTypeValue, formData: FormData): Record<string, unknown> {
  switch (type) {
    case "URL":
      return { url: formData.get("content_url") };
    case "TEXT":
      return { text: formData.get("content_text") };
    case "PHONE":
      return { phone: formData.get("content_phone") };
    case "EMAIL":
      return {
        to: formData.get("content_to"),
        subject: formData.get("content_subject") || undefined,
        body: formData.get("content_body") || undefined,
      };
    case "WIFI":
      return {
        ssid: formData.get("content_ssid"),
        password: formData.get("content_password") || undefined,
        encryption: formData.get("content_encryption") || "WPA",
        hidden: formData.get("content_hidden") === "on",
      };
    case "VCARD":
      return {
        firstName: formData.get("content_firstName"),
        lastName: formData.get("content_lastName") || undefined,
        org: formData.get("content_org") || undefined,
        title: formData.get("content_title") || undefined,
        phone: formData.get("content_phone_vcard") || undefined,
        email: formData.get("content_email_vcard") || undefined,
      };
  }
}
