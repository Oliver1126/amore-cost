/**
 * The Amore Cost mark: the actual designed logo asset (a two-tone ring
 * with motion chevrons and a centered α% glyph), not a hand-coded SVG
 * approximation — see `public/brand-mark.png` (250x154 source) and
 * decision 0011. `size` sets the rendered width; height follows the
 * source's own aspect ratio so the mark never stretches.
 */
const ASPECT_RATIO = 154 / 250;

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/brand-mark.png"
      alt="Amore Cost"
      width={size}
      height={Math.round(size * ASPECT_RATIO)}
      style={{ display: "block" }}
    />
  );
}
