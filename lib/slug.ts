const MAX_SLUG_LENGTH = 72;

export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");

  return slug || "qr-code";
}

export function slugCandidateFromLabelOrUrl(label: string, destinationUrl?: string): string {
  const labelSlug = slugify(label);
  if (labelSlug !== "qr-code") return labelSlug;

  if (!destinationUrl) return labelSlug;

  try {
    const url = new URL(destinationUrl);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.split("/").filter(Boolean).slice(0, 3).join("-");
    return slugify([host, path].filter(Boolean).join("-"));
  } catch {
    return labelSlug;
  }
}
