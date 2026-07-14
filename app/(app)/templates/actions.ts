"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { dotStyleValues, cornerStyleValues } from "@/lib/qr-style";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
  dotStyle: z.enum(dotStyleValues),
  cornerStyle: z.enum(cornerStyleValues),
  logoUrl: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
});

export type TemplateFormState = { error?: string; success?: boolean };

export async function createBrandTemplate(
  _prevState: TemplateFormState,
  formData: FormData
): Promise<TemplateFormState> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = templateSchema.safeParse({
    name: formData.get("name"),
    foreground: formData.get("foreground"),
    background: formData.get("background"),
    dotStyle: formData.get("dotStyle"),
    cornerStyle: formData.get("cornerStyle"),
    logoUrl: formData.get("logoUrl") || null,
    isDefault: formData.get("isDefault") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  if (data.isDefault) {
    await prisma.brandTemplate.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  await prisma.brandTemplate.create({ data });

  revalidatePath("/templates");
  return { success: true };
}

export async function deleteBrandTemplate(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await prisma.brandTemplate.delete({ where: { id } });
  revalidatePath("/templates");
}
