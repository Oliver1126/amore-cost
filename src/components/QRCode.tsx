"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeImage({ text, size = 200 }: { text: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(text, { width: size, margin: 1 }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [text, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-surface-muted rounded-lg animate-pulse"
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt={`QR code encoding "${text}"`} width={size} height={size} className="rounded-lg" />;
}
