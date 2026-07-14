"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import type { StyleConfig } from "@/lib/qr-style";
import { effectiveErrorCorrectionLevel } from "@/lib/qr-style";

export function QrPreview({
  data,
  style,
  size = 260,
}: {
  data: string;
  style: StyleConfig;
  size?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    instanceRef.current = new QRCodeStyling(buildOptions(data, style, size));
    instanceRef.current.append(container);

    return () => {
      container.innerHTML = "";
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    instanceRef.current?.update(buildOptions(data, style, size));
  }, [data, style, size]);

  return <div ref={containerRef} className="inline-block" />;
}

function buildOptions(data: string, style: StyleConfig, size: number) {
  const hasLogo = Boolean(style.logoUrl);
  return {
    width: size,
    height: size,
    type: "svg" as const,
    data,
    margin: style.margin,
    qrOptions: {
      errorCorrectionLevel: effectiveErrorCorrectionLevel(hasLogo),
    },
    image: style.logoUrl ?? undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.35,
      margin: 6,
    },
    dotsOptions: {
      type: style.dotStyle,
      color: style.foreground,
    },
    cornersSquareOptions: {
      type: style.cornerStyle,
      color: style.foreground,
    },
    backgroundOptions: {
      color: style.background,
    },
  };
}
