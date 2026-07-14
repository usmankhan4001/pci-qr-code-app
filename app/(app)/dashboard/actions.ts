"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateShortcode } from "@/lib/shortcode";

export async function cloneQrCode(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  const original = await prisma.qrCode.findUnique({ where: { id } });
  if (!original) return;

  const clone = await prisma.qrCode.create({
    data: {
      shortcode: generateShortcode(),
      label: `${original.label} (copy)`,
      type: original.type,
      contentConfig: original.contentConfig as object,
      destinationUrl: original.destinationUrl,
      styleConfig: original.styleConfig as object,
      tags: original.tags,
      brandTemplateId: original.brandTemplateId,
      createdById: session.user.id,
    },
  });

  redirect(`/qr/${clone.id}/edit`);
}

export async function setQrStatus(id: string, status: "ACTIVE" | "ARCHIVED"): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await prisma.qrCode.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard");
}

export async function deleteQrCode(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await prisma.qrCode.delete({ where: { id } });
  revalidatePath("/dashboard");
}
