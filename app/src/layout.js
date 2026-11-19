// Panel geometry for each export size: a hero panel plus two smaller panels, and a caption band along the foot.
// The layout is chosen by aspect, not by exact pixels, so the three post sizes share one poster language.
export const EXPORT_SIZES = [
  { label: '1080 × 1080', width: 1080, height: 1080 },
  { label: '1080 × 1350', width: 1080, height: 1350 },
  { label: '1920 × 1080', width: 1920, height: 1080 },
];

/** Returns the caption band height and the three panel rectangles for a poster of `width` by `height`. */
export function panelRects(width, height) {
  const band = Math.round(height * 0.16); // caption band along the foot
  const top = height - band; // panels fill everything above the band
  const g = Math.max(6, Math.round(width * 0.011)); // gutter between panels
  const aspect = width / height;
  if (aspect >= 1.5) {
    // Landscape: hero on the left, two panels stacked on the right.
    const heroW = Math.round(width * 0.62);
    const sideX = heroW + g;
    const sideW = width - sideX;
    const half = Math.round((top - g) / 2);
    return {
      band,
      panels: [
        { key: 'hero', x: 0, y: 0, w: heroW, h: top },
        { key: 'a', x: sideX, y: 0, w: sideW, h: half },
        { key: 'b', x: sideX, y: half + g, w: sideW, h: top - half - g },
      ],
    };
  }
  if (aspect < 1) {
    // Portrait: hero on top, two panels side by side below it.
    const heroH = Math.round(top * 0.62);
    const rowY = heroH + g;
    const half = Math.round((width - g) / 2);
    return {
      band,
      panels: [
        { key: 'hero', x: 0, y: 0, w: width, h: heroH },
        { key: 'a', x: 0, y: rowY, w: half, h: top - rowY },
        { key: 'b', x: half + g, y: rowY, w: width - half - g, h: top - rowY },
      ],
    };
  }
  // Square: hero on the left, two panels stacked on the right.
  const heroW = Math.round(width * 0.66);
  const sideX = heroW + g;
  const sideW = width - sideX;
  const half = Math.round((top - g) / 2);
  return {
    band,
    panels: [
      { key: 'hero', x: 0, y: 0, w: heroW, h: top },
      { key: 'a', x: sideX, y: 0, w: sideW, h: half },
      { key: 'b', x: sideX, y: half + g, w: sideW, h: top - half - g },
    ],
  };
}
