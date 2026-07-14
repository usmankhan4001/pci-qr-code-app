import { z } from "zod";

export const dotStyleValues = [
  "square",
  "rounded",
  "dots",
  "classy",
  "classy-rounded",
  "extra-rounded",
] as const;

export const cornerStyleValues = ["square", "extra-rounded", "dot"] as const;

export const styleConfigSchema = z.object({
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
  dotStyle: z.enum(dotStyleValues).default("square"),
  cornerStyle: z.enum(cornerStyleValues).default("square"),
  logoUrl: z.string().optional().nullable(),
  margin: z.number().int().min(0).max(40).default(8),
});

export type StyleConfig = z.infer<typeof styleConfigSchema>;

/**
 * A logo sitting on top of QR modules obscures part of the code, so it must
 * always be paired with a higher error-correction level or scans will start
 * failing intermittently once printed at small sizes. This is enforced here
 * rather than left to the UI so a template edited later can't silently drop
 * below a safe level while a logo is still attached.
 */
export function effectiveErrorCorrectionLevel(hasLogo: boolean): "M" | "Q" | "H" {
  return hasLogo ? "H" : "M";
}
