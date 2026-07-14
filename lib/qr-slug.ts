import { prisma } from "@/lib/prisma";
import { generateShortcode } from "@/lib/shortcode";
import { slugify } from "@/lib/slug";

export async function resolveUniqueQrSlug(candidate: string, currentQrId?: string): Promise<string> {
  const base = slugify(candidate);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const slug = `${base.slice(0, 72 - suffix.length)}${suffix}`;
    const existing = await prisma.qrCode.findFirst({
      where: {
        OR: [{ slug }, { shortcode: slug }],
        ...(currentQrId ? { NOT: { id: currentQrId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return slug;
  }

  return `${base.slice(0, 63)}-${generateShortcode().toLowerCase()}`;
}
